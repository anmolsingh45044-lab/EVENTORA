const express=require('express')
const app=express()
const cors=require('cors')
const authRoutes=require('./routes/auth.js')
const eventRoutes=require('./routes/event.js')
const bookingRoutes=require('./routes/booking.js')


app.use(express.json())
app.use(cors());

//routes
app.use('/api/auth',authRoutes)
app.use('/api/events',eventRoutes)
app.use('/api/bookings',bookingRoutes)



module.exports=app