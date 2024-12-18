# Code Style Guide

## Variable Naming

1. **CamelCase for Variables and Functions**
   - Use camelCase for variable and function names.
   - Example: `fileBuffer`, `validateFileType`

2. **UPPER_SNAKE_CASE for Constants**
   - Use UPPER_SNAKE_CASE for global constants.
   - For constants that are temporary, such as in a function, if they are dynamically assigned then they do not have to follow this
   - Example: `SECRET_FILE_PATH`, `DATABASE_FILE_PATH`

3. **Descriptive and Meaningful Names**
   - Use names that clearly convey the purpose of the variable or function.
   - Example: `extractTextFromPdf`, `privateKeys`

4. **Imported Modules**
   - Use the default name matching the library or a meaningful alias.
   - Example: `const pdfParse = require('pdf-parse');`

5. **Singular and Plural Nouns**
   - Use singular nouns for individual items and plural nouns for collections.
   - Example: `user` (single user), `privateKeys` (collection of keys)

6. **Prefixes for Boolean Variables**
   - Use clear prefixes for boolean variables.
   - Example: `isValidFileType`, `hasError`


## Code Formatting

### Indentation and Spacing
1. Use 4 spaces for indentation throughout the codebase.
2. Add a space after control flow keywords and before curly braces. Depending on clarity, putting a starting curly brace on a newline is ok.
   - Example:
     ```javascript
     if (err) { 
       console.error(err); 
     }
     ```
3. Always use braces `{}` for control structures, even if the block contains a single statement.
4. Add blank lines to separate logical blocks of code for readability.



### Commenting Conventions

1. Use inline comments sparingly to explain complex or non-obvious code.
2. Place inline comments on a separate line above the code they refer to.
3. Provide meaningful messages in `console.error` to help trace issues.
    - For errors that happen "frequently" such as the file uploaded being too large, these can be commented out or left out for the production version to not clutter the console with unnecessary information
4. Place a comment explaining what functions or large groups of code do on the line above them


### Name Declaration

- Include this in your code (mainly above functions) to distinguish between your work and others (doesn't have to be exact, but at least close):
```
//===================== NAME =====================
```