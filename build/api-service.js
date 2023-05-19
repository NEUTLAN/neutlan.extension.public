export class API {

    static NEUTLAN_URL = 'https://neutlan.com/api';
    //static NEUTLAN_URL_MODEL = 'https://neutlan.com/api';

    static post(endpoint, TOKEN = null, body = {}) {
        var headers = { 
            Accept: "application/json",
            "Content-Type": "application/json" 
        }
        
        if ( TOKEN != null ) {
            headers['Authorization'] = 'Token ' + TOKEN;
        }
        
        return fetch(this.NEUTLAN_URL + endpoint, {
            method: "POST",
            headers: headers,
            body: JSON.stringify(body)
        })
    }

    static get(endpoint, TOKEN = null, body = {}) {
        var headers = { 
            Accept: "application/json",
            "Content-Type": "application/json" 
        }
        
        if ( TOKEN != null) {
            headers['Authorization'] = 'Token ' + TOKEN;
        }

        return fetch(this.NEUTLAN_URL + endpoint, {
            method: "GET",
            headers: headers,
            body: JSON.stringify(body)
        })
    }

    //Model

}