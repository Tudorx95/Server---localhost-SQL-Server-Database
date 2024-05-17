
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const app = express();
const port = 8888;
const ipAddress = 'localhost';

const config= require('./dbConfig');
const sqlConnectionToServer= require('mssql');


const users = [
    { username: 'tudor', password: '1324', roles: ['employee'] },
    { username: 'admin', password: '1234', roles: ['admin'] },
    { username: 'andrei', password: '7231', roles: ['manager'] },
    { username: 'marian', password: '5555', roles: ['manager'] }
];


const corsOptions = {
    origin: 'http://localhost:3000',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
};

app.use(cors(corsOptions));

app.use(bodyParser.json());
app.use(express.static('public'));

app.post('/login', async (req, res) => {
    
    try {
        const { user, pwd } = req.body;
        console.log(user,pwd);
        // Check if user exists and password matches
        //const userCred = users.find(u => u.username === user && u.password === pwd);
        
        const pool= await sqlConnectionToServer.connect(config);
        const result= pool.request()
        .input('username',sqlConnectionToServer.VarChar,user)
        .input('password', sqlConnectionToServer.VarChar, pwd)
        .query(`select Angajat.Nume,Angajat.Tip_Angajat from Angajat where Angajat.Nume=@username and Angajat.Tip_Angajat=@password`);
        
            
        if ((await result).recordset.length===0) {
            return res.status(401).json({ error: 'Invalid username or password' });
        }

        const userRoles=(await result).recordset[0].Tip_Angajat;
        console.log(userRoles);
        

        // Generate JWT token
        const accessToken = jwt.sign({ username: user, roles: userRoles }, 'secretKey');
        res.json({ accessToken, roles: user.roles });

    } catch (err) {
        console.log(err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.get('/dashboard', async (req, res) => {

    try {
        const pool= await sqlConnectionToServer.connect(config);
        const result= pool.request()
        .query(`select Angajat.Nume,Angajat.Tip_Angajat from Angajat`);
        
  
      if (!result) {
        return res.status(401).json({ message: 'Invalid token.' });
      }
      console.log((await result).recordset);
      // Accesul la pagina protejata este permis
      
      res.json(result);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Error verifying token.' });
    } 
});

app.listen(port, () => {
    console.log(`Server running at http://${ipAddress}:${port}`);
});
