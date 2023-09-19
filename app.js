const express = require("express")
const path = require("path")
const logger = require("morgan")
const bodyParser = require("body-parser")
const neo4j = require("neo4j-driver")
require("dotenv").config()

const app = express()

//View Engine
app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'ejs')

app.use(logger('dev'))
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }))
app.use(express.static(path.join(__dirname, 'public')))

const driver = neo4j.driver(process.env.NEO4J_URI, neo4j.auth.basic(process.env.NEO4J_USERNAME, process.env.NEO4J_PASSWORD))
const session = driver.session()



app.get('/', async (req, res) => {

    let User =[]
    try {
        await session.run('MATCH (n:User) RETURN n ').then(res => {

            res.records.forEach((rec) => {
                User.push({
                    id: rec._fields[0].identity.low,
                    name: rec._fields[0].properties.name,
                    userName: rec._fields[0].properties.username,
                    role: rec._fields[0].properties.roles,
                    password: rec._fields[0].properties.password
                })

            })

        })

        let Lessons = []

        await session.run('MATCH (n:Lesson) RETURN n').then(res=>{

            res.records.forEach(el=>{
                Lessons.push({
                    id: el._fields[0].identity.low,
                    identifier: el._fields[0].properties.identifier ,
                    title: el._fields[0].properties.title,
                })
            })
        })

        let Course = []

        await session.run('MATCH (n:Course) RETURN n').then(res=>{

            res.records.forEach(el=>{
                Course.push({
                    id: el._fields[0].identity.low,
                    identifier: el._fields[0].properties.identifier ,
                    title: el._fields[0].properties.title,
                    teacher: el._fields[0].properties.teacher,
                })
            })
        })


        res.render('index',{
            user:User,
            lessons:Lessons,
            course:Course
        })
    } catch (error) {

    }
    // res.send(User)
})

app.listen(process.env.PORT)
console.log(`Server is running on port 8080`)

module.exports = app