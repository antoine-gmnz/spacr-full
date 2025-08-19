import { configApp } from '@adonisjs/eslint-config'

export default configApp({
  parserOptions: {
    tsconfigRootDir: import.meta.dirname,
    project: ['./tsconfig.json']
  }
})
