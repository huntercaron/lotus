// next.config.js
const withTM = require("next-transpile-modules")([
    "drei",
    "three",
    "postprocessing",
]) // pass the modules you would like to see transpiled

module.exports = {
    ...withTM(),
    typescript: {
        ignoreDevErrors: true,
        ignoreBuildErrors: true,
    },
}
