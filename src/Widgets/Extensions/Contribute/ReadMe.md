### Contribute

* Possibility to create a new document
* Possibility to edit and delete existing documents

[Demo](https://github.com/sophiaab/UDV/tree/new_contribute/UDV-Core/src/Extensions/Contribute/example)

### About the demo

The document-related functionalities of this demo have been generated from
the file 'contributeConfig.json'.

It is used to configure dependencies towards an external data server, as well as
the following UD-Viz (document-related) views:
 - Document browser
 - Document creation
 - Document research

See how to set the configuration:
https://github.com/MEPP-team/VCity/wiki/Configuring-UDV

In this particular demo, a document is defined by the following attributes:

Metadata:
  - title
  - description
  - referring date
  - publication date
  - type
  - subject

Visualization:
  - positionX, positionY, positionZ
  - quaternionX, quaternionY, quaternionZ, quaternionW

In this demo, all attributes are mandatory. They have to be set by the user when
he wishes to create a new document. This is a choice of configuration for this
demo. It is also possible to define optional attributes.

All attributes in 'metadata' are displayed in the browser.

Attributes having their "queryable" property set to "true" or to "keyword" can be
queried.
