import express from 'express';

// Importing Routes
import userRoute  from './routes/user.js';

const port = 5000;
const app = express();

// Using Routes
app.use("/api/v1/user", userRoute);

app.listen(port, ()=>{
    console.log(`Express is working on http://localhost:${port}`);
})