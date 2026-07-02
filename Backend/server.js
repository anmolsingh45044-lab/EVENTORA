const dns = require('dns');
dns.setDefaultResultOrder('ipv4first');

const app=require('./src/app');
    require('dotenv').config();
    const connectDB=require('./src/db/db')


async function start(){
    await connectDB();
const PORT = process.env.PORT || 5000;
      app.listen(PORT,()=>{
    console.log("server is now live")
})
}
start();
