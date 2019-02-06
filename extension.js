const vscode = require('vscode');
const fs = require('fs');
const path = require('path');

/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {

	// The command has been defined in the package.json file
	// Now provide the implementation of the command with  registerCommand
	// The commandId parameter must match the command field in package.json
	let disposable = vscode.commands.registerCommand('extension.newFilesFromTemplate', function (info) {
		// The code you place here will be executed every time your command is executed

		const directoryPath = info.fsPath;

		const config = vscode.workspace.getConfiguration('newFilesFromTemplates');
		// console.log('got it', Object.keys(config));
		const templates = config.get('templates');
		// console.log('The templates', templates);

		const templateNames = Object.keys(templates);

		vscode.window.showInputBox({
			placeHolder: "Enter file name"
		}).then(filename => {
			vscode.window.showQuickPick(
				templateNames,
				{ canPickMany: false }
			).then(result => {
				const selectedTemplate = templates[result];

				if (typeof selectedTemplate === 'undefined') {
					vscode.window.showInformationMessage(`There was an unexpected error when creating the file.`);
					return;
				}

				const templateArray = Array.isArray(selectedTemplate) ? selectedTemplate : [];

				const filesToCreate = templateArray.map(fileDefinition => {
					const { extension, template } = fileDefinition;

					const ext = extension[0] === '.' ? extension : `.${extension}`;

					const filenameToWrite = path.join(directoryPath, `${filename}${ext}`);

					return {
						filename: filenameToWrite,
						contents: template
					};
				});

				filesToCreate.map((fileDescription) => {
					fs.appendFile(fileDescription.filename, fileDescription.contents, () => {
						// If I don't add this callback, then VSCode throws an error.
					});
				});
			});
		});
	});

	context.subscriptions.push(disposable);
}
exports.activate = activate;

// this method is called when your extension is deactivated
function deactivate() {}

module.exports = {
	activate,
	deactivate
}
