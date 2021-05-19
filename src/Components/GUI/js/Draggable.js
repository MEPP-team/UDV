// Code from https://www.w3schools.com/howto/howto_js_draggable.asp
// Make the DIV element draggable:
export function dragElement(elmnt, dragelmnt) {
    var pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
    
    dragelmnt.onmousedown = dragMouseDown;

    function dragMouseDown(e) {
        e = e || window.event;
        // get the mouse cursor position at startup:
        pos3 = e.clientX;
        pos4 = e.clientY;
        document.onmouseup = closeDragElement;
        // call a function whenever the cursor moves:
        document.onmousemove = elementDrag;
    }

    function elementDrag(e) {
        e = e || window.event;
        e.preventDefault();
        // calculate the new cursor position:
        pos1 = pos3 - e.clientX;
        pos2 = pos4 - e.clientY;
        pos3 = e.clientX;
        pos4 = e.clientY;
        // set the element's new position:
        let newTop = (elmnt.offsetTop - pos2);
        if (newTop < 0) {
            newTop = 0;
        }
        let newLeft = (elmnt.offsetLeft - pos1);
        if (newLeft < 0) {
            newLeft = 0;
        }
        elmnt.style.top = newTop + "px";
        elmnt.style.left = newLeft + "px";
    }

    function closeDragElement() {
        // stop moving when mouse button is released:
        document.onmouseup = null;
        document.onmousemove = null;
    }
}