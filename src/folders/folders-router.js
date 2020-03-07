const express = require('express')
const FoldersService = require('./folders-service')
// const xss = require('xss')
// const path = require('path')
const folderRouter = express.Router()
const jsonParser = express.json()


folderRouter
    .route('/')
    .get((req, res, next) => {
        const knexInstance = req.app.get('db')
        FoldersService.getAllFolders(knexInstance)
            .then(folders => {
                res.json(folders.map(folder => ({
                    id: folder.id,
                    name: folder.name
                })))
            })
            .catch(next)
    })
    .post(jsonParser, (req, res, next) => {
        const {name} = req.body
        const newFolder = {name}
        if(name == null)
            return res.status(400).json({
                error: {message: 'Missing folder name in request body'}
            })
            FoldersService.insertFolder(
                req.app.get('db'),
                newFolder
            )
        FoldersService.insertFolder(
            req.app.get('db'),
            newFolder
        )
        .then(folder => {
            res
                .status(201)
                .location(path.posix.join(req.originalUrl,`/${folder.id}`))
        })
        .catch(next)
    })

folderRouter
.route('/:folder_id')
.all((req, res, next) => {
    FoldersService.getById(
        req.app.get('db'),
        req.params.folder_id
    )
    .then(folder => {
        if(!folder) {
            return res.status(404).json({
                error: {message: 'Folder does not exist'}
            })
        }
        req.folder = folder
        next()
    })
    .catch(next)
})
.get((req, res, next) => {
    const {folder} = req;
    res.json({
        id: folder.id,
        name: folder.name
    })
})
.delete((req, res, next) => {
    FoldersService.deleteFolder(
        req.app.get('db'),
        req.params.folder_id
    )
    .then(numRowsAffectd => {
        res.status(204).end()
    })
    .catch(next)
})
.patch(jsonParser, (req, res, next) => {
    const {name} = req.body
    const folderToUpdate = {name}

    if(folderToUpdate == null) {
        return res.status(400).json({
            error: {
                message: `Request body must contain 'name'`
            }
        })
    }
    FoldersService.updateFolder(
        req.app.get('db'),
        req.params.folder_id,
        folderToUpdate
    )
    .then(numRowsAffectd => {
        res.status(204).end()
    })
    .catch(next)
})

module.exports = folderRouter;