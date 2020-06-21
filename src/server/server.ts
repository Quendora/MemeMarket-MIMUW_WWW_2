import errorHandler from "errorhandler";

import app from "./app";

app.use(errorHandler());

const server = app.listen(1500, () => {
    console.log("App is running at http://localhost:%d", 1500);
    console.log("Press CTRL-C to stop\n");
});

export default server;