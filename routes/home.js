///////////////////////////////
// Import Router
////////////////////////////////
const router = require("express").Router()
const bcrypt = require("bcrypt")
const User = require("../models/User")


///////////////////////////////
// Custom Middelware Functions
////////////////////////////////

// Middleware to check if userId is in sessions and create req.user
const addUserToRequest = async (req, res, next) => {
    if (req.session.userId) {
        req.user = await User.findById(req.session.userId)
        next()
    } else {
        next()
    }
}

// Authorize Middleware Function to check if user authorized for route
const isAuthorized = (req, res, next) => {
    // check if user session property exists, if not redirect back to login page
    if (req.user) {
        //if user exists, wave them by to go to router handler
        next()
    } else {
        // redirect the not logged in user
        res.redirect("/auth/login")
    }
}

///////////////////////////////
// Router Specific Middleware
////////////////////////////////

router.use(addUserToRequest)

///////////////////////////////
// Router Routes
////////////////////////////////

router.get("/", (req, res) => {
    res.render("home")
})

// AUTH RELATED ROUTES

// SIGNUP ROUTES
router.get("/auth/signup", (req, res) => {
    res.render("auth/signup")
})

router.post("/auth/signup", async (req, res) => {
    try {
        // generate salt for hashing
        const salt = await bcrypt.genSalt(10)
        // hash the password
        req.body.password = await bcrypt.hash(req.body.password, salt)
        // Create the User
        await User.create(req.body)
        // Redirect to login page
        res.redirect("/auth/login")
    } catch (error) {
        res.json(error)
    }
})

// Login ROUTES
router.get("/auth/login", (req, res) => {
    res.render("auth/login")
})

router.post("/auth/login", async (req, res) => {
    try {
        // check if the user exists (make sure to use findOne not find)
        const user = await User.findOne({ username: req.body.username })
        if (user) {
            // check if password matches
            const result = await bcrypt.compare(req.body.password, user.password)
            if (user) {
                // create user session property
                req.session.userId = user._id
                // redirect to /images.ejs
                res.redirect("/images")
            } else {
                //send error: password doesn't match
                res.json({ error: "passwords don't match" })
            }
        } else {
            // send error if user doesn't exist
            res.json({ error: "User does not exist" })
        }
    } catch (error) {
            res.json(error)
        }
    })

// Logout ROUTE
router.get("/auth/logout", (req, res) => {
    // remove the userId property from the session
    req.session.userId = null
    // redirect back to the main page
    res.redirect("/")
})

// Images Index Route render view (we will include new form on the index page) (protecte by auth middleware)
router.get("/images", isAuthorized, async (req, res) => {
    // get updated user
    const user = await User.findOne({ username: req.user.username })
    // render template passing it list of goals
    res.render("images", {
        images: user.images
    })
})

// Images Create Route when form is submitted
router.post("/images", isAuthorized, async (req, res) => {
    // fetch up to date user 
    const user = await User.findOne({ username: req.user.username })
    // push new image and save
    user.images.push(req.body)
    await user.save()
    // redirect back to goals index
    res.redirect("/images")
})

// Edit Image Router
router.get("/images/:id/edit", isAuthorized, async (req, res) => {
    // fetch user
    const user = await User.findOne({ username: req.user.username })
    // find the image that matches the id
    const image = user.images.find(image => (image._id.toString() === req.params.id))
    console.log(image)
    // render the edit page
    res.render("edit", { image })
})

///////////////////////////////
// Export Router
////////////////////////////////
module.exports = router