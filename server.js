const express = require('express');
const passport = require('passport');
const GitHubStrategy = require('passport-github').Strategy;
const session = require('express-session');

const app = express();

// Konfiguration der Sitzung
app.use(session({ secret: 'geheimnisvolles-geheimnis', resave: true, saveUninitialized: true }));

// Initialisiere Passport und setze die Sitzungsstrategie
app.use(passport.initialize());
app.use(passport.session());

passport.use(new GitHubStrategy({
  clientID: '1c37905e8618fb6b5c27',
  clientSecret: 'f759af45778fb7305e54fbef0928cae947af1cef',
  callbackURL: 'http://localhost:3000/geschuetzte-seite',
},
(accessToken, refreshToken, profile, done) => {
  // Hier kannst du den Benutzer in deiner Datenbank speichern oder überprüfen, ob er bereits existiert.
  return done(null, profile);
}));

passport.serializeUser((user, done) => {
  done(null, user);
});

passport.deserializeUser((obj, done) => {
  done(null, obj);
});

// Routen
app.get('/', (req, res) => {
  res.send('<h1>Willkommen auf der Startseite</h1><a href="/auth/github">Mit GitHub anmelden</a>');
});

app.get('/auth/github',
  passport.authenticate('github'));

app.get('/auth/github/callback',
  passport.authenticate('github', { failureRedirect: '/' }),
  (req, res) => {
    // Erfolgreiche Authentifizierung: Hier kannst du den Benutzer auf die Hauptseite weiterleiten oder weitere Aktionen durchführen.
    res.redirect('/');
  });

app.get('/logout', (req, res) => {
  req.logout();
  res.redirect('/');
});

// Schutz für bestimmte Routen, die eine Authentifizierung erfordern
function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect('/');
}

app.get('/geschuetzte-seite', ensureAuthenticated, (req, res) => {
  res.send('<h1>Geschützte Seite</h1><a href="/logout">Logout</a>');
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server läuft auf Port ${PORT}`);
});
