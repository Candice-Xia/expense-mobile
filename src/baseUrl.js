let baseUrl = "/";
switch (process.env.NODE_ENV) {
    case 'production':
        baseUrl = window.location.href;
        var ind = baseUrl.toLowerCase().lastIndexOf("/mobile/");
        baseUrl = baseUrl.substring(baseUrl.indexOf('/', 9), ind + 1);
        break
}
export default baseUrl;