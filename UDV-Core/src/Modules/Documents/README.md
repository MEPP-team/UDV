# Documents Module

The documents module is responsible for managing and display documents. Its purpose is to retrieve documents from a server, filter them to have a restrain list, display this list and allow the use to navigate inside (by seeing the details of each document).

The module is also extensible, which means that other modules can serve as plug-ins extending the functionnalities of the documents module. They can to that in many ways :

- Change the source of documents
- Apply new filters
- Add a window to display
- Modify the search and/or the browser windows to add elements such as text, buttons, etc.

## Basic functionnalities

In the [demo](./Example/Demo.html), you can try out the basic functionnalities of the document modules. It can:

- Fetch all documents from the server. It's actually the default comportement (and may change in the future for scaling purpose). The user can filter the retrieved list according to some filters: keywords in the title/description, subject, publication or refering date.
- Display the details of one particular documents, and navigate through the documents list. The navigation can be done either by selecting a document in the document list, or by using navigation arrows in the document browser.

The demo also includes the `DocumentVisualizer` module, that adds an "Orient" button in the document browser. When pressed, the button moves the camera to the "visualization" position specified in the document, and the image of the document is displayed in superposition to the scene.

## Installation

Adding the documents module in a demo is pretty simple :

```js
////// DOCUMENTS MODULE
const documentModule = new udvcore.DocumentModule(requestService, baseDemo.config)
baseDemo.addModuleView('documents', documentModule.view);

////// DOCUMENTS VISUALIZER (to orient the document)
const imageOrienter = new udvcore.DocumentImageOrienter(documentModule, baseDemo.view, baseDemo.controls);
```

In this example, we actually add the document visualizer in addition to the documents module.

### Required configuration

The minimal configuration required to make the documents module work is the following :

```json
{
  "type": "class",
  "server":{
    "url":"http://localhost:1525/",
    "document": "document",
    "file": "file"
  }
}
```

### Dependencies

The documents module depends on the utility `RequestService` to perform HTTP requests, and require the demo configuration to get the server addresses.

The document visualizer depends on the documents module, and the iTowns view and camera controls from the demo.

![Dependencies graph](./Doc/Pictures/dependencies.png)

## Code architecture

The code architectures follows an [MVVM](https://en.wikipedia.org/wiki/Model%E2%80%93view%E2%80%93viewmodel) architectural pattern.

- The model is responsible for holding the documents. It fetches them from the server and store them in a list. The objects responsible for making the requests are the `DocumentFetcher` and the `DocumentSource`.
- The view model serves as an interface between the view and the model. It holds a `DocumentProvider` that retrieve the document list fetched by the model, and dispatch it into two types of documents. First, the filtered documents is a smaller list of documents reduced according to some filters (which are istances of `DocumentFilter`). Second, it holds a reference to the "displayed document" which is one particular document in the filtered documents list.
- The view is responsible to display the data in the view model and react to user input. It has two windows : a search window that holds a form corresponding to search filters and displays the filtered documents list. It also has a browser window that shows the displayed document. In the code, the view is separated into three classes : the `DocumentView` holds a reference to the two windows, `DocumentSearchWindow` and `DocumentBrowser`.

## Extensions

In this part, we are explaining how other modules can extend the functionnalities of the document module by serving as "plug-ins".

A module that wishes to extend the documents module should take a `DocumentModule` object in its constructor. This object is the root of the module and provide a direct access to the instances of the view, view model and the model. However, an extending module should only uses methods from the `DocumentModule` in order to correctly work. The only exception is the windows that extends `AbstractDocumentWindow`, which are given access to the view model and the view.

### Adding visual elements

Adding visual interface elements to the view can be done in two ways :

- Extending one of the search or browser window.
- Adding a new window.

#### Extending the search or browser window

Extending one the existing windows can be done pretty easily from the `DocumentModule`:

```js
documentModule.addBrowserExtension('MyExtension', {
  type: 'button',
  html: 'Click here to show the title !',
  callback: (doc) => {
    alert('The title of the current document is : ' + doc.title);
  }
});
```

In this example, we add a button (`type: 'button'`) in the browser window. Its text shall be 'Click here to show the title !' and when clicked, it displays the title of the displayed document.

As you can see, adding an extension is done by providing a descriptive object that specifies a type, the HTML content and eventually a callback. For the moment, only two types are supported : 'button' which is a button that triggers a callback, and 'panel' which is simply a chunk of static HTML.

```js
documentModule.addBrowserExtension('MyExtension', {
  type: 'panel',
  html: `
    <h3>My Extension</h3>
    <p>
      The title of the document is : <span id="title"></span>
    </p>
  `
});
documentModule.addEventListener(DocumentModule.EVENT_DISPLAYED_DOC_CHANGED, (doc) => {
  document.getElementById('title').innerText = doc.title;
});
```

In this example, we create a new section in the browser window that keeps track of the document title. We do this by passing a string of HTML, in which a `span` tag has a specific 'title' ID that we can use later. We then adds an event listener so that when the currently displayed document change, our custom section will update and render the title.

The `addBrowserExtension` also has an equivalent for the search window, which is called `addSearchWindowExtension`. It has the same behaviour, except on difference for the buttons elements : the callback does not pass the displayed document as parameter, but the list of filtered documents.

#### Adding a new window

The addition of a new window for documents is made through the `AbstractDocumentWindow` class (in the `View` folder) that represents a window responsible for display document data, and interacting with the document provider. The base code inside the extending window should look like like this :

```js
export class ExtensionWindow extends AbstractDocumentWindow {
  constructor() {
    super('Extension Name');
  }

  get innerContentHtml() {
    return /*html*/`

    `;
  }

  windowCreated() {
    this.hide();
  }

  documentWindowReady() {
    
  }
}
```

This window is empty and does nothing. In fact, it doesn't event displays as we specified `this.hide()` when the window is created. This will allow us to display the window when the user clicks on a button in the document browser for example, but we'll see that in a few paragraphs. For the moment, let's just register our new window :

```js
// OtherFile.js
let myWindow = new ExtensionWindow();
documentModule.addDocumentWindow();
```

This code tells the view to register the new document window in its windows list. We can also do this in the `ExtensionWindow` by taking the documents module as parameter of the constructor :

```js
// ExtensionWindow.js
constructor(documentModule) {
  documentModule.addDocumentWindow(this);
}

// OtherFile.js
let myWindow = new ExtensionWindow(documentModule);
```

Now that we've done that, what actually changed is that our window has access to the view and the view model of the documents module. It has two members, `view` and `provider` refering to the `DocumentView` and the `DocumentProvider`. They are not warranted to be instantiated right at the beginning, but we provide a hook function that triggers when these two elements are set :

```js
documentWindowReady() {
  // `provider` and `view` are now usable
  this.provider.addEventListener(DocumentProvider.EVENT_FILTERED_DOCS_UPDATED,
    (docs) => {});
  this.provider.addEventListener(DocumentProvider.EVENT_DISPLAYED_DOC_CHANGED,
    (doc) => {});
}
```

Now we need to add a button to actually display our window. Let's say we want to add this button in the document browser. All we need to do is the following :

```js
documentModule.addBrowserExtension('MyExtension', {
  type: 'button',
  html: 'Show my window',
  callback: () => myWindow.requestDisplay()
});
```

The `requestDisplay` methods tells the view to display the specified window.