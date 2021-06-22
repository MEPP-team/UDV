import { Window } from "../../../Components/GUI/js/Window";
import { EventSender } from "../../../Components/Events/EventSender";



export class IfcAttributeWindow extends Window {
    constructor(ifcId) {
        super('ifcAttribute', 'ifc Attribute', false);


        this.ifcId = ifcId.substring(0, ifcId.lastIndexOf('_'));
        
        this.login = "clement.colin69@gmail.com";
        this.psw = "admin";

        this.token = undefined;
        this.roid = undefined;
        this.oid = undefined;
        this.serialiazerOid = undefined;
        this.downloadToken = undefined;
        this.serverUrl = "http://localhost:8888/BIMserver/json";
        this.serverGetUrl = "http://localhost:8888/BIMserver/download";

        this.jsonObject = undefined;

    }

    get innerContentHtml() {
        return /*html*/`
        <div id="${this.ifcAttributeID}">Object</div>
        `;
    }

    windowCreated() {
        this.logInBimServer();
        this.getProjectsByName();
        this.getSerializerByName();
        this.getOidByGuid();
        if(!!this.oid)
        {
            this.download();
            this.getProgress();
            this.getDownloadData();

            let div = this.ifcAttributeElement;
            let html = "Classe : " + this.jsonObject._t + "<br>";
            html +=  "GlobalId : " + this.jsonObject.GlobalId + "<br>";
            html +=  "Name : " + this.jsonObject.Name + "<br>";
            html +=  "Object Type : " + this.jsonObject.ObjectType + "<br>";
            html +=  "Predefined Type : " + this.jsonObject.PredefinedType + "<br>";
            html +=  "Typed by : <ul>";
            for(let obj in this.jsonObject._rIsTypedBy){
                html +=  "<li>" + this.jsonObject._rIsTypedBy[obj]._t +" "+ this.jsonObject._rIsTypedBy[obj]._i + " </li>";
            }
            html +=  "</ul>Defined by : <ul>";
            for(var obj in this.jsonObject._rIsDefinedBy){
                console.log(obj);
                html +=  "<li>" + this.jsonObject._rIsDefinedBy[obj]._t +" "+ this.jsonObject._rIsDefinedBy[obj]._i + " </li>";
            }
            html+= "</ul>";
            div.innerHTML = html;

        }

    }


    logInBimServer() {
        $.ajax({
            type: "POST",
            url: this.serverUrl,
            async: false,
            data: `{
                "request": {
                  "interface": "AuthInterface", 
                  "method": "login", 
                  "parameters": {
                    "username": "admin@admin.fr",
                    "password": "admin"
                  }
                }
              }`,
            datatype: 'json',
            success: (data) => {
                this.token = data.response.result;
            }
        });
    }


    getProjectsByName() {
        let json = `{
            "token":"` + this.token + `",
                "request": {
                    "interface": "ServiceInterface", 
                    "method": "getProjectsByName", 
                    "parameters": {
                        "name": "carl"
                    }
                }
            }
          `;
        $.ajax({
            type: "POST",
            url: this.serverUrl,
            async: false,
            data: json,
            datatype: 'json',
            success: (data) => {
                this.roid = data.response.result[0].lastRevisionId;
            }
        });
    }

    getSerializerByName() {
        let json = `{
            "token":"` + this.token + `",
                "request": {
                    "interface": "ServiceInterface", 
                    "method": "getSerializerByName", 
                    "parameters": {
                      "serializerName": "Json (Streaming)"
                    }
                }
            }
          `;
        $.ajax({
            type: "POST",
            url: this.serverUrl,
            async: false,
            data: json,
            datatype: 'json',
            success: (data) => {
                this.serialiazerOid = data.response.result.oid;
            }
        });
    }

    getOidByGuid() {
        let json = `{
            "token":"` + this.token + `",
            "request": {
                "interface": "ServiceInterface", 
                "method": "getOidByGuid", 
                "parameters": {
                  "roid": ` + this.roid + `,
                  "guid": "` + this.ifcId + `"
                }
              }
            }
          `;
        $.ajax({
            type: "POST",
            url: this.serverUrl,
            async: false,
            data: json,
            datatype: 'json',
            success: (data) => {
                this.oid = data.response.result;
            }
        });
    }

    download(){
        let json = `{
            "token":"` + this.token + `",
            "request": {
                "interface": "ServiceInterface", 
                "method": "download", 
                "parameters": {
                  "roids": ["` + this.roid + `"],
                  "query": "{\\"oids\\":[` + this.oid + `]}",
                  "serializerOid": `+ this.serialiazerOid + `,
                  "sync": "false"
                }
            }
        }
          `;
        $.ajax({
            type: "POST",
            url: this.serverUrl,
            async: false,
            data: json,
            datatype: 'json',
            success: (data) => {
                this.downloadToken = data.response.result;
            }
        });
    }

      

    getProgress(){
        let json = `{
            "token":"` + this.token + `",
            "request": {
                "interface": "NotificationRegistryInterface", 
                "method": "getProgress", 
                "parameters": {
                  "topicId": ` + this.downloadToken + `
                }
              }
        }
          `;
        $.ajax({
            type: "POST",
            url: this.serverUrl,
            async: false,
            data: json,
            datatype: 'json',
            success: (data) => {
                console.log(data);
            }
        });
    }

    getDownloadData() {
        let json = `topicId=` + this.downloadToken + `&token=` + this.token; 
        $.ajax({
            type: "GET",
            url: this.serverGetUrl,
            async: false,
            data : json,
            datatype: 'json',
            success: (data) => {
                this.jsonObject = data.objects[0];
                console.log(data);
            }
        });
    }

    get ifcAttributeID() {
        return `${this.windowId}_ifc_attribute`;
    }

    get ifcAttributeElement() {
        return document.getElementById(this.ifcAttributeID);
    }

}