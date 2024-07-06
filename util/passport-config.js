const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const jwt = require('jsonwebtoken'); // For JWT operations
const JwtStrategy = require('passport-jwt').Strategy; // Correctly importing JwtStrategy
const ExtractJwt = require('passport-jwt').ExtractJwt;
const User = require('../models/user');
const bcrypt = require('bcrypt');

const jwtLogin = new JwtStrategy(
    {
        jwtFromRequest: ExtractJwt.fromHeader('authorization'),
        secretOrKey: process.env.JWT_SECRET,
    },
    async (payload, done) => {
        try {
            const user = await User.findById(payload.id);

            if (user) {
                done(null, user);
            } else {
                done(null, false);
            }
        } catch (err) {
            done(err, false);
        }
    },
);

passport.use(jwtLogin);


const googleLogin = new GoogleStrategy(
    {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: `http://localhost:3000/api/users/google/callback`,
        proxy: true,
    },
    async (accessToken, refreshToken, profile, done) => {
        const email = profile.emails[0]?.value;
        try {
            const oldUser = await User.findOne({ where : {email: email} });

            if (oldUser) {
                return done(null, oldUser);
            }
        } catch (err) {
            console.log(err);
        }

        try {
            const newUser = await User.create({
                google_id: profile.id,
                email: email,
                name: profile.displayName,
                rating_count: 1,
                rating_avg: 3.0
                
            });
            done(null, newUser);
        } catch (err) {
            console.log(err);
        }
    },
);

passport.use(googleLogin);
