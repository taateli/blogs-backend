module.exports = {
    "env": {
        "es6": true,
        "node": true
    },
    "parser": "babel-eslint",
    "extends": "eslint:recommended",
    "rules": {
        "indent": [
            "error",
            2
        ],
        "eqeqeq": "error",
        "no-trailing-spaces": "error",
        "object-curly-spacing": [
        "error", "always"
        ],
        "arrow-spacing": [
           "error", { "before": true, "after": true }
        ],
        "no-console": 0,
        "linebreak-style": [
            "error",
            "unix"
        ],
        "quotes": [
            "error",
            "single"
        ],
        "semi": [
            "error",
            "never"
        ]
        
    },
    "globals": {
        "test": true,
        "expect": true,
        "describe": true
    }
};