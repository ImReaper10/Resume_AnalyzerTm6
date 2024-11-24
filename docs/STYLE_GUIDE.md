//====================================VARIABLE NAMING================================================================================

1.Use camelCase for variable and function names.
Example: fileBuffer, validateFileType

2.Use UPPER_SNAKE_CASE for constants.
Example: SECRET_FILE_PATH, DATABASE_FILE_PATH

3.Use descriptive and meaningful names that clearly convey the purpose of the variable or function.
Example: extractTextFromPdf, privateKeys

4.For imported modules, use the default name matching the library or a meaningful alias.
Example: const pdfParse = require('pdf-parse');

5.Use singular nouns for individual items and plural nouns for collections.
Example: user (single user), privateKeys (collection of keys)

6.Use clear prefixes for boolean variables.
Example: isValidFileType, hasError



//====================================CODE FORMATTING================================================================================
Indentation and Spacing:
1.Use 2 spaces for indentation throughout the codebase
2.Add a space after control flow keywords and before curly braces.
if (err) {
  console.error(err);
}
3.Always use braces {} for control structures, even if the block contains a single statement.
4.Add blank lines to separate logical blocks of code for readability

//====================================COMMENTING CONVENTIONS==========================================================================
1.Use inline comments sparingly to explain complex or non-obvious code.
2.Place inline comments on a separate line above the code they refer to
3.Provide meaningful messages in console.error to help trace issues

Include this in your code to distinguish between your work and others
//================================================== NAME =======================================================================