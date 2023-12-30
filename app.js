// const express = require('express');
// const mongoose = require('mongoose');
// const session = require('express-session');
// const bodyParser = require('body-parser');
// const methodOverride = require('method-override');

// mongoose.connect('mongodb://localhost:27017/datas');

// const app = express();
// const PORT = process.env.PORT || 2000;

// // Middleware
// app.use(session({
//     secret: 'mysecretkey',  // Change this to a more secure secret
//     resave: false,
//     saveUninitialized: true
// }));

// app.use(methodOverride('_method'));
// app.use(bodyParser.urlencoded({ extended: true }));
// app.use(bodyParser.json());

// // Mongoose model and schema
// const Dschema = new mongoose.Schema({
//     name: String,
//     email: String,
//     password: String
// }, { versionKey: false });

// const dmodel = mongoose.model('users', Dschema);

// app.set('view engine', 'ejs');

// // Routes

// app.get('/', async (req, res) => {
//     try {
//         const users = await dmodel.find({});
//         res.render('login', { error: '' });
//     } catch (error) {
//         console.log(error);
//     }
// });

// app.post('/login', async (req, res) => {
//     const { email, password } = req.body;
//     try {
//         const user = await dmodel.findOne({ email, password });
//         if (user) {
//             req.session.userId = user._id;
//             res.redirect('/dash');
//         } else {
//             res.render('login', { error: 'Invalid email or password' });
//         }
//     } catch (error) {
//         console.error('Error logging in:', error);
//         res.status(500).send('Internal Server Error');
//     }
// });


// app.get('/signin', (req, res) => {
//     res.render('signup', { error: '' });
// });


// app.get('/dash', async (req, res) => {
//     const userId = req.session.userId;
//     try {
//         if (userId) {
//             const user = await dmodel.findById(userId);
//             if (user) {
//                 res.render('dashboard', { user: [user] });
//             } else {
//                 res.redirect('/');
//             }
//         } else {
//             res.redirect('/');
//         }
//     } catch (error) {
//         console.log(error);
//     }
// });

// app.post('/submit', async (req, res) => {
//     try {
//         const existingUser = await dmodel.findOne({ email: req.body.email });
//         if (existingUser) {
//             return res.render('signup', { error: 'User already Exist' });
//         }

//         const newUser = new dmodel({
//             name: req.body.name,
//             email: req.body.email,
//             password: req.body.password
//         });

//         await newUser.save();
//         res.redirect('/dash');
//     } catch (error) {
//         console.error('Error saving user data to MongoDB:', error);
//         res.status(500).send('Internal Server Error');
//     }
// });

// app.get('/edit/:id', async (req, res) => {
//     const userId = req.session.userId;
//     if (userId === req.params.id) {
//         try {
//             const user = await dmodel.findById(userId);
//             if (user) {
//                 res.render('editform', { user: user });
//             } else {
//                 res.status(404).json({ error: 'user not found' });
//             }
//         } catch (error) {
//             console.error('Error fetching user for edit:', error);
//             res.status(500).json({ error: 'Internal Server Error' });
//         }
//     } else {
//         res.status(403).send('Forbidden');
//     }
// });

// app.post('/update/:id', async (req, res) => {
//     const userId = req.session.userId;
//     if (userId === req.params.id) {
//         const { name, email, password } = req.body;
//         try {
//             const result = await dmodel.findByIdAndUpdate(userId, { name, email, password });
//             if (result) {
//                 res.redirect('/dash');
//             } else {
//                 res.status(404).json({ error: 'user not found' });
//             }
//         } catch (error) {
//             console.error('Error updating user:', error);
//             res.status(500).json({ error: 'Internal Server Error' });
//         }
//     } else {
//         res.status(403).send('Forbidden');
//     }
// });

// app.delete('/deleteall/:id', async (req, res) => {
//     const userId = req.session.userId;
//     if (userId === req.params.id) {
//         try {
//             const result = await dmodel.findByIdAndDelete(userId);
//             if (result) {
//                 res.status(204).end();
//             } else {
//                 res.status(404).json({ error: 'user not found' });
//             }
//         } catch (error) {
//             console.error('Error deleting user:', error);
//             res.status(500).json({ error: 'Internal Server Error' });
//         }
//     } else {
//         res.status(403).send('Forbidden');
//     }
// });

// app.listen(PORT, () => {
//     console.log(`Server is running on port ${PORT}`);
// });



const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const bodyParser = require('body-parser');
const methodOverride = require('method-override');

mongoose.connect('mongodb://localhost:27017/datas');

const app = express();
const PORT = process.env.PORT || 2000;

// Middleware to prevent caching
app.use((req, res, next) => {
    res.header('Cache-Control', 'no-store, private, no-cache, must-revalidate, max-stale=0, post-check=0, pre-check=0');
    next();
});

// Session middleware
app.use(session({
    secret: 'mysecretkey',  // Change this to a more secure secret
    resave: false,
    saveUninitialized: true
}));

app.use(methodOverride('_method'));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Mongoose model and schema
const Dschema = new mongoose.Schema({
    name: String,
    email: String,
    password: String
}, { versionKey: false });

const dmodel = mongoose.model('users', Dschema);

app.set('view engine', 'ejs');

// Middleware to check session
function requireLogin(req, res, next) {
    if (!req.session.userId) {
        return res.redirect('/');
    }
    next();
}

// Routes

app.get('/', async (req, res) => {
    try {
        const users = await dmodel.find({});
        res.render('login', { error: '' });
    } catch (error) {
        console.log(error);
    }
});

app.post('/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await dmodel.findOne({ email, password });
        if (user) {
            req.session.userId = user._id;
            res.redirect('/dash');
        } else {
            res.render('login', { error: 'Invalid email or password' });
        }
    } catch (error) {
        console.error('Error logging in:', error);
        res.status(500).send('Internal Server Error');
    }
});

app.get('/signin', (req, res) => {
    res.render('signup', { error: '' });
});

app.get('/dash', requireLogin, async (req, res) => {
    const userId = req.session.userId;
    try {
        if (userId) {
            const user = await dmodel.findById(userId);
            if (user) {
                res.render('dashboard', { user: [user] });
            } else {
                res.redirect('/');
            }
        } else {
            res.redirect('/');
        }
    } catch (error) {
        console.log(error);
    }
});

app.post('/submit', async (req, res) => {
    try {
        const existingUser = await dmodel.findOne({ email: req.body.email });
        if (existingUser) {
            return res.render('signup', { error: 'User already Exist' });
        }

        const newUser = new dmodel({
            name: req.body.name,
            email: req.body.email,
            password: req.body.password
        });

        await newUser.save();
        res.redirect('/dash');
    } catch (error) {
        console.error('Error saving user data to MongoDB:', error);
        res.status(500).send('Internal Server Error');
    }
});

app.get('/edit/:id', requireLogin, async (req, res) => {
    const userId = req.session.userId;
    if (userId === req.params.id) {
        try {
            const user = await dmodel.findById(userId);
            if (user) {
                res.render('editform', { user: user });
            } else {
                res.status(404).json({ error: 'user not found' });
            }
        } catch (error) {
            console.error('Error fetching user for edit:', error);
            res.status(500).json({ error: 'Internal Server Error' });
        }
    } else {
        res.status(403).send('Forbidden');
    }
});

app.post('/update/:id', requireLogin, async (req, res) => {
    const userId = req.session.userId;
    if (userId === req.params.id) {
        const { name, email, password } = req.body;
        try {
            const result = await dmodel.findByIdAndUpdate(userId, { name, email, password });
            if (result) {
                res.redirect('/dash');
            } else {
                res.status(404).json({ error: 'user not found' });
            }
        } catch (error) {
            console.error('Error updating user:', error);
            res.status(500).json({ error: 'Internal Server Error' });
        }
    } else {
        res.status(403).send('Forbidden');
    }
});

app.delete('/deleteall/:id', requireLogin, async (req, res) => {
    const userId = req.session.userId;
    if (userId === req.params.id) {
        try {
            const result = await dmodel.findByIdAndDelete(userId);
            if (result) {
                res.status(204).end();
            } else {
                res.status(404).json({ error: 'user not found' });
            }
        } catch (error) {
            console.error('Error deleting user:', error);
            res.status(500).json({ error: 'Internal Server Error' });
        }
    } else {
        res.status(403).send('Forbidden');
    }
});

app.get('/logout', (req, res) => {
    req.session.destroy(err => {
        if (err) {
            console.error('Error destroying session:', err);
            return res.status(500).send('Internal Server Error');
        }
        res.redirect('/');
    });
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
