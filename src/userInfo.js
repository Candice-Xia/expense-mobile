import VueCookies from 'vue-cookies'
export default {
    get DepartmentID() { return VueCookies.get("DepartmentID"); },
    get EmployeeID() { return VueCookies.get("EmployeeID"); },
    get UserName() { return VueCookies.get("UserName"); },
    get IsAP() { return VueCookies.get("IsAP") == 1; },
    get IsManager() { return VueCookies.get("IsManager") == 1; },
    get token() {
        var token = VueCookies.get("token");
        var tokenExpiresDate = parseInt(VueCookies.get('tokenExpiresDate'));
        if (!token || ((new Date()).getTime() / 1000) > tokenExpiresDate) {
            return null;
        }
        return token;
    },
    SetupToken(token, expires_in) {
        VueCookies.set("token", token, 0);
        VueCookies.set(
            "tokenExpiresDate",
            new Date().getTime() / 1000 + expires_in,
            0
        );
    },
    SetupUserInfo(data) {
        VueCookies.set("DepartmentID", data.DepartmentID, 0);
        VueCookies.set("EmployeeID", data.EmployeeID, 0);
        VueCookies.set(
            "UserName",
            data.FirstName + " " + data.LastName,
            0
        );
        VueCookies.set("IsAP", data.IsAP ? 1 : 0, 0);
        VueCookies.set("IsManager", data.IsManager ? 1 : 0, 0);
    },
    ClearUp() {
        this.SetupUserInfo({});
        VueCookies.set("token", '', 0);
        VueCookies.set("tokenExpiresDate", 0, 0);
    }
}