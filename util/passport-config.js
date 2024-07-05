const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcrypt');

passport.use(new LocalStrategy(
    async function(username, password, done) {
        try {
            let user = await User.findOne({ where: { email: username } }); // Assuming email is used as username
            if (!user) {
                return done(null, false, { message: 'Incorrect username.' });
            }
            const validPassword = await bcrypt.compare(password, user.password);
            if (!validPassword) {
                return done(null, false, { message: 'Incorrect password.' });
            }
            return done(null, user);
        } catch (err) {
            return done(err);
        }
    }
));


passport.use(
    new GoogleStrategy({
            clientID: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            callbackURL: "/auth/google/callback"
        },
        async (accessToken, refreshToken, profile, done) => {
            try {
                let user = await User.findOne({ googleId: profile.id });
                if (!user) {
                    user = await User.create({
                        googleId: profile.id,
                        displayName: profile.displayName,
                        emails: profile.emails.map(email => ({ id: email.value })),
                        photos: profile.photos ? profile.photos[0].value : null,
                    });
                }
                return done(null, user);
            } catch (error) {
                done(error, null);
            }
        }
    ));
