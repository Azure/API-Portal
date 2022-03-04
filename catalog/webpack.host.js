const path = require("path");
const CopyWebpackPlugin = require("copy-webpack-plugin");


const apiConfig = {
    mode: "development",
    target: "node",
    node: {
        __dirname: false,
        __filename: false,
    },
    entry: {
        "index": ["./src/startup.host.ts"]
    },
    output: {
        filename: "./[name].js",
        path: path.resolve(__dirname, "./dist/host")
    },
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                loader: "ts-loader",
                options: {
                    allowTsInNodeModules: true
                }
            }
        ]
    },
    plugins: [
        new CopyWebpackPlugin({
            patterns: [
                { from: `./data`, to: `./data` },
                { from: "./src/config.host.json", to: "config.json" }
            ]
        })
    ],
    resolve: {
        extensions: [".ts", ".tsx", ".js", ".jsx"]
    }
};

module.exports = [apiConfig]