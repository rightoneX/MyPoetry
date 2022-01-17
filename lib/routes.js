var util = require('util');
var express = require('express');
var app = express();
var passport = require("passport");

var fs = require('fs');
var request = require('request');
const { Pool, Client } = require('pg')

const bcrypt = require('bcrypt')
const uuidv4 = require('uuid/v4');
//TODO
//Add forgot password functionality
//Add email confirmation functionality
//Add edit account page

app.use(express.static('public'));

const LocalStrategy = require('passport-local').Strategy;

var currentAccountsData = [];
var logedUserData = [];

const pool = new Pool({
	user: "postgres",
	host: "localhost",
	database: "postgres",
	password: "postgres",
	port: "5433",
	ssl: false
});

module.exports = function (app) {

	app.get('/', function (req, res, next) {
		res.render('index', { title: "My Website", pageTitle: "", navTitle: "", userData: req.user, messages: { danger: req.flash('danger'), warning: req.flash('warning'), success: req.flash('success') } });
		console.log(req.user);
	});

	app.get('/join', function (req, res, next) {
		res.render('join', { title: "My Website", pageTitle: "", navTitle: "", userData: req.user, messages: { danger: req.flash('danger'), warning: req.flash('warning'), success: req.flash('success') } });
	});

	app.get('/about', function (req, res, next) {
		res.render('index', { title: "My Website - About", pageTitle: "", navTitle: "", userData: req.user, messages: { danger: req.flash('danger'), warning: req.flash('warning'), success: req.flash('success') } });
	});

	app.get('/fav', function (req, res, next) {
		res.render('index', { title: "My Website - Favorites", pageTitle: "", navTitle: "", userData: req.user, messages: { danger: req.flash('danger'), warning: req.flash('warning'), success: req.flash('success') } });
	});

	//shows the record by id in database
	app.get('/id/:id', async function (req, res) {
		try {
			const client = await pool.connect()
			// await client.query('BEGIN')
			await JSON.stringify(client.query("SELECT id, author, text, title FROM poetry WHERE id = '" + req.params.id + "'", function (err, result) {
				if (err){
					res.render('id', {
						title: "My Website",
						userDataMessage: "На этот запрос данных нет !"					
					});
				}else{		
					if(result.rowCount > 0){						
						// res.setHeader('Content-Type', 'text/html');
						res.render('id', {
						title: "My Website",
						poetryTitle: result.rows[0].title,
						poetryAuthor: result.rows[0].author,
						poetryId: result.rows[0].id,
						poetryText: result.rows[0].text,
						userData: req.user
					});
					}else{
						res.render('id', {
							title: "My Website",
							userDataMessage: "На этот запрос данных нет !"
						});
					}
			}
			}));
			client.release();
		}
		catch (e) {
			throw (e);
		}
	});

	//shows the poetry list by author
	app.get('/list/:author', async function (req, res) {
		try {
			var poetryTitle = [];
			var poetryAuthor = [];
			var poetryId = [];
			const client = await pool.connect()
			await client.query('BEGIN')
			await JSON.stringify(client.query("SELECT id, text, title, author FROM poetry WHERE author = '" + req.params.author + "'", function (err, result) {
				    if (err) return console.error(err);  
					for (var i = 0; i < result.rows.length; i++) {
						poetryTitle.push(result.rows[i].title);
						poetryAuthor.push(result.rows[i].author);
						poetryId.push(result.rows[i].id);
					}
					if(result.rowCount < 1){
						res.render('list', {
							title: "My Website",
							userDataMessage: "На этот запрос данных нет !"					
						});
					}else{
						res.render('list', {
							title: "My Website",
							poetryDataTitle: poetryTitle,
							poetryDataAuthor: poetryAuthor,
							poetryDataId: poetryId,
							userData: req.user,
							userDataMessage: ""					
						});
					}
			}));
			client.release();
		}
		catch (e) {
			throw (e);
		}
	});


	
//shows the poetry search by author
app.get('/search/:letter', async function (req, res) {
	try {
		var poetryTitle = [];
		var poetryAuthor = [];
		var poetryId = [];
		const client = await pool.connect()
		await client.query('BEGIN')
		await JSON.stringify(client.query("SELECT id, text, title, author FROM poetry WHERE author SIMILAR TO '" + req.params.letter + "%'", function (err, result) {
				if (err) return console.error(err);  
				for (var i = 0; i < result.rows.length; i++) {
					poetryTitle.push(result.rows[i].title);
					poetryAuthor.push(result.rows[i].author);
					poetryId.push(result.rows[i].id);
				}
				if(result.rowCount < 1){
					res.render('search', {
						title: "My Website",
						userDataMessage: "На этот запрос данных нет !"					
					});
				}else{
					res.render('search', {
						title: "My Website",
						poetryDataTitle: poetryTitle,
						poetryDataAuthor: poetryAuthor,
						poetryDataId: poetryId,
						userData: req.user,
						userDataMessage: ""					
					});
				}
		}));
		client.release();
	}
	catch (e) {
		throw (e);
	}
});



	app.get('/join', function (req, res, next) {
		res.render('join', {title: "Join", userData: req.user, messages: {danger: req.flash('danger'), warning: req.flash('warning'), success: req.flash('success')}});
	});
	
	
	app.post('/join', async function (req, res) {		
		try{
			const client = await pool.connect()
			await client.query('BEGIN')
			var pwd = await bcrypt.hash(req.body.password, 5);
			await JSON.stringify(client.query('SELECT id FROM "user" WHERE "email"=$1', [req.body.username], function(err, result) {
				if(result.rows[0]){
					req.flash('warning', "This email address is already registered. <a href='/login'>Log in!</a>");
					res.redirect('/join');
				}
				else{
					client.query('INSERT INTO "user" (id, "firstName", "lastName", email, password) VALUES ($1, $2, $3, $4, $5)', [uuidv4(), req.body.firstName, req.body.lastName, req.body.username, pwd], function(err, result) {
						if(err){console.log(err);}
						else {
						
						client.query('COMMIT')
							console.log(result)
							req.flash('success','User created.')
							res.redirect('/login');
							return;
						}
					});
		
				}				
			}));
			client.release();
		} 
		catch(e){throw(e)}
	});
	
	app.get('/account', function (req, res, next) {
		if(req.isAuthenticated()){
			// console.log(logedUserData);
				res.render('account', {
				title: "Account", 
				userData: logedUserData,
				messages: {danger: req.flash('danger'), warning: req.flash('warning'), success: req.flash('success')}});
		}
		else{
			res.redirect('/login');
		}
	});
	
	app.get('/login', function (req, res, next) {
		if (req.isAuthenticated()) {
			res.redirect('/account');
		}
		else{
			res.render('login', {title: "Log in", userData: req.user, messages: {danger: req.flash('danger'), warning: req.flash('warning'), success: req.flash('success')}});
		}
		
	});
	
	app.get('/logout', function(req, res){
		
		console.log(req.isAuthenticated());
		req.logout();
		console.log(req.isAuthenticated());
		req.flash('success', "Logged out. See you soon!");
		res.redirect('/');
	});
	
	app.post('/login',	passport.authenticate('local', {
		successRedirect: '/account',
		failureRedirect: '/login',
		failureFlash: true
		}), function(req, res) {
		if (req.body.remember) {
			req.session.cookie.maxAge = 30 * 24 * 60 * 60 * 1000; // Cookie expires after 30 days
			} else {
			req.session.cookie.expires = false; // Cookie expires at end of session
		}
		res.redirect('/');
	});
	
	
	
}

passport.use('local', new  LocalStrategy({passReqToCallback : true}, (req, username, password, done) => {
	
	loginAttempt();
	async function loginAttempt() {
		const client = await pool.connect()
		try{
			await client.query('BEGIN')
			var currentAccountsData = await JSON.stringify(client.query('SELECT id, "firstName", "lastName", "email", "password" FROM "user" WHERE "email"=$1', [username], function(err, result) {				
				if(err) {
					return done(err)
				}	
				if(result.rows[0] == null){
					req.flash('danger', "Oops. Incorrect login details.");
					return done(null, false);
				}
				else{
					bcrypt.compare(password, result.rows[0].password, function(err, check) {
						if (err){
							console.log('Error while checking password');
							return done();
						}
						else if (check){
							// console.log(result.rows);
							logedUserData = result.rows; 
							return done(null, [{email: result.rows[0].email, firstName: result.rows[0].firstName, lastName: result.rows[0].lastName}]);
						}
						else{
							req.flash('danger', "Oops. Incorrect login details.");
							return done(null, false);
						}
					});
				}
			}))
		}
		
		catch(e){throw (e);}
	};
	
}
))




passport.serializeUser(function(user, done) {
	done(null, user);
});

passport.deserializeUser(function(user, done) {
	done(null, user);
});		