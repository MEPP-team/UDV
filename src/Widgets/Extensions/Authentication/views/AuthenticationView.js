//Components
import { ModuleView } from '../../../../Components/ModuleView/ModuleView';

import './AuthenticationView.css';

export class AuthenticationView extends ModuleView {

    constructor(authenticationService) {
        super();
        this.authenticationService = authenticationService;
    }

    html() {
        return `
            <form id="RegistrationForm">\
                <h2>Registration</h2> \
                <h3 id="RegisterInfo" class=""></h3>
                <label for="Firstname">Firstname</label>\
                <input type="text" name="firstName" id="Firstname"/>\
                <label for="Lastname">Lastname</label>\
                <input type="text" name="lastName" id="Lastname"/>\
                <label for="Username">Username</label>\
                <input type="text" name="username" id="Username"/>\
                <label for="Email">Email</label>\
                <input type="text" name="email" id="Email"/>\
                <label for=PasswordRegistration>Password</label>\
                <input type="password" name="password" id="PasswordRegistration"/>\
                <!--<label for="ConfirmPasswordRegistration"> Confirm Password*</label>\
                <input type="password" name="confirmPassword" id="ConfirmPasswordRegistration"/>-->\
                <button type="button" name="register" id="RegisterButton">Register</button>\
                
            </form>\
            \
            <form id="LoginForm">\
                <h2>Login</h2>\
                <h3 id="LoginInfo" class="ErrorBox"></h3>
                <label for="Login">Username</label>\
                <input type="text" id="login" name="username"/>\
                <label for=PasswordLogin>Password</label>\
                <input type="password" id="PasswordLogin" name="password"/>\
                <div>Forgot your password?</div>\
                <button type="button" id="LoginButton">Login</button>\
            </form>\
            <button id="loginRegistrationCloseButton">Close</button>\
        `;
    }

    appendToElement(htmlElement) {
        let div = document.createElement('div');
        div.innerHTML = this.html();
        div.id = "loginRegistrationWindow";
        htmlElement.appendChild(div);
        document.getElementById('loginRegistrationCloseButton').onclick = () => {
            this.disable()
        };
        document.getElementById('LoginButton').onclick = () => {
            this.logInFunction()
        };
        document.getElementById('RegisterButton').onclick = () => {
            this.registerFunction()
        };
        document.getElementById('PasswordRegistration').onkeypress = () => {
            if ((event.key) == "Enter") this.registerFunction()
        };
        document.getElementById('PasswordLogin').onkeypress = () => {
            if ((event.key) == "Enter") this.logInFunction()
        };
    }


    dispose() {
        let div = document.getElementById('loginRegistrationWindow');
        return div.parentNode.removeChild(div);
    }

    displayRegisterError(msg) {
        let errorField = document.getElementById('RegisterInfo');
        errorField.className = "ErrorBox"
        errorField.innerHTML = msg;
    };

    displayLoginError(msg) {
        let errorField = document.getElementById('LoginInfo');
        errorField.innerHTML = msg;
    };

    displayRegisterSuccess(msg) {
        let successField = document.getElementById('RegisterInfo');
        successField.className = "SuccessBox";
        successField.innerHTML = msg;
    }

    isVisible() {
        let div = document.getElementById('loginRegistrationWindow');
        return div !== undefined && div !== null;
    }
    verifyNotEmptyValuesForm(formIds) {
        var validate = true;
        for (var id in formIds) {
            let element = document.getElementById(formIds[id]);
            element.setAttribute("style", "");
            if (element.value == "") {
                element.setAttribute("style", " border: 3px solid red");
                validate = false;
            }
        }
        return validate;
    }
    deleteValuesForm(formIds) {
        for (var id in formIds) {
            let element = document.getElementById(formIds[id]);
            element.value = "";
        }
    }
    verifymail() {
        // This regular expression checks an email in the form of 'name@example.com'
        let RegularExpression = /^(([^<>()[]\.,;:s@]+(.[^<>()[]\.,;:s@]+)*)|(.+))@(([[0-9]{1,3}.[0-9]{1,3}.[0-9]{1,3}.[0-9]{1,3}])|(([a-zA-Z-0-9]+.)+[a-zA-Z]{2,}))$/;
        let element = document.getElementById("Email");
        if (RegularExpression.test(element.value)) {
            element.setAttribute("style", "");
            this.displayRegisterError("");
            return true;
        }
        else {
            element.setAttribute("style", " border: 3px solid red");
            this.displayRegisterError("Please insert a valid mail");
            return false;
        }
    }

    async logInFunction() {
        this.displayLoginError('');
        const loginForm = document.getElementById('LoginForm');
        const formData = new FormData(loginForm);
        var formIds = ['login', 'PasswordLogin'];
        if (this.verifyNotEmptyValuesForm(formIds)) {
            try {
                await this.authenticationService.login(formData);
                this.disable();
            } catch (e) {
                if (e.status === 401) {
                    this.displayLoginError("Login or password invalid");
                }

            }
        }
    }

    async registerFunction() {
        this.displayRegisterError('');
        const registerForm = document.getElementById('RegistrationForm');
        const formData = new FormData(registerForm);
        var formIds = ['Firstname', 'Lastname', 'Username', 'Email', 'PasswordRegistration'];
        if (this.verifyNotEmptyValuesForm(formIds) & this.verifymail()) {
            try {
                await this.authenticationService.register(formData);
                this.deleteValuesForm(formIds);
                this.displayRegisterSuccess("Your registration succeed");

            } catch (e) {
                if (e.status == '422') {
                    this.displayRegisterError('The user already exist');
                }
                else {
                    this.displayRegisterError(e.response);
                }
            }
        }


    };
    /////// MODULE MANAGEMENT FOR BASE DEMO

    enableView() {
        this.appendToElement(this.parentElement);
    }

    disableView() {
        this.dispose();
    }
}
