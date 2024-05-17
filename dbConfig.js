const config={
    user: 'CodingServer',
    password: 'foo',
    server: 'DESKTOP-LT',   
    database: 'Apple Inc.',
    options:{
        trustServerCertificate:true,
        trustedConnection:false,
        enableArithAbort:true,
        instancename:'SQLEXPRESS'
    }, 
    port: 1433
}

module.exports = config;