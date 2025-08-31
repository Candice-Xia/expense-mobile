const BASE_URL = process.env.NODE_ENV === 'production'
    ? './{MOBILE_SITE_PATH}'
    : '/';
module.exports = {
    configureWebpack: {
        devtool: 'source-map'
    },
    pluginOptions: {
        vuetify: {
        }
    },
    publicPath: BASE_URL,
    outputDir: "./target",//"../WebAPI/Mobile",
    devServer: {
        port: 8080,
        proxy: {
            
            '/Home': {
                target: 'http://localhost/expense.mobile/Home/',
                ws: false,
                changeOrigin: true,
                pathRewrite: {
                    '^/Home': '/'
                }
            },                
            '/Vue': {
                target: 'http://localhost/expense.mobile/Vue/',
                ws: false,
                changeOrigin: true,
                pathRewrite: {
                    '^/Vue': '/'
                }
            },                        
            '/api': {
                target: 'http://localhost/expense.mobile/api/',
                ws: false,
                changeOrigin: true,
                pathRewrite: {
                    '^/api': '/'
                }
            },    
            '/ExpenseReport': {
                target: 'http://localhost/expense.mobile/ExpenseReport/',
                ws: false,
                changeOrigin: true,
                pathRewrite: {
                    '^/ExpenseReport': '/'
                }
            },
            '/TempFile': {
                target: 'http://localhost/expense.mobile/TempFile/',
                ws: false,
                changeOrigin: true,
                pathRewrite: {
                    '^/TempFile': '/'
                }
            },
            '/Data': {
                target: 'http://localhost/expense.mobile/Data/',
                ws: false,
                changeOrigin: true,
                pathRewrite: {
                    '^/Data': '/'
                }
            },
            '/Attachment': {
                target: 'http://localhost/expense.mobile/Attachment/',
                ws: false,
                changeOrigin: true,
                pathRewrite: {
                    '^/Attachment': '/'
                }
            },
            '/Meal': {
                target: 'http://localhost/expense.mobile/Meal/',
                ws: false,
                changeOrigin: true,
                pathRewrite: {
                    '^/Meal': '/'
                }
            },        
            '/MultiItems': {
                target: 'http://localhost/expense.mobile/MultiItems/',
                ws: false,
                changeOrigin: true,
                pathRewrite: {
                    '^/MultiItems': '/'
                }
            }    
        }
    }
}