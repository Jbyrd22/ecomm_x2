module.exports = ({ content }) => {
	return `
        <!DOCTYPE html>
        <html>
            <head>
                <title>My Ecomm Site</title>
            </head>
            <body>
                ${content}
            </body>
        </html>
    `;
};
