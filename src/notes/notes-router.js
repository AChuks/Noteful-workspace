const express = require('express')
const NotesService = require('./notes-service')
const noteRouter = express.Router()
const jsonParser = express.json()
const path = require('path')
noteRouter
    .route('/')
    .get((req, res, next) => {
        const knexInstance = req.app.get('db')
        NotesService.getAllNotes(knexInstance)
            .then(notes => {

                res.json(notes.map(note => ({
                    id: note.id,
                    name: note.name,
                    modified: note.modified,
                    content: note.content,
                    folderid: note.folderid
                })))
                console.log(notes)
            })
            .catch(next)
    })
    .post(jsonParser, (req, res, next) => {
        const {
            name,
            content,
            folderid
        } = req.body
        const newNote = {
            name,
            content,
            folderid
        }
        for (const [key, value] of Object.entries(newNote))
            if (value == null)
                return res.status(400).json({
                    error: {
                        message: `Missing ${key} in request body`
                    }
                })
        NotesService.insertNote(
                req.app.get('db'),
                newNote
            ).then(note => {
                res
                    .status(201)
                    .location(`${req.originalUrl}/${note.id}`)
                    .json(note)
            })
            .catch(next)
    })
noteRouter
    .route('/:note_id')
    .all((req, res, next) => {
        NotesService.getById(
                req.app.get('db'),
                req.params.note_id
            ).then(note => {
                if (!note) {
                    return res.status(404).json({
                        error: {
                            message: 'Note does not exist'
                        }
                    })
                }
                req.note = note
                next()
            })
            .catch(next)
    })
    .get((req, res, next) => {
        const {
            note
        } = req.body
        res.json({
            id: note.id,
            name: note.name,
            modified: note.modified,
            content: note.content,
            folderid: note.folderid
        })
    })
    .delete((req, res, next) => {
        NotesService.deleteNote(
                req.app.get('db'),
                req.params.note_id
            )
            .then(numRowsAffected => {
                res.status(204).end()
            })
            .catch(next)
    })
    .patch(jsonParser, (req, res, next) => {
        const {
            name,
            content,
            folderid
        } = req.body
        const noteToUpdate = {
            name,
            content,
            folderid
        }
        const numberOfValues = Object.values(noteToUpdate).filter(Boolean).length

        if (numberOfValues === 0) {
            return res.status(400).json({
                error: {
                    message: `Request body must contain either 'name', 'content', or 'folderid'`
                }
            })
        }
        NotesService.updateNote(
                req.app.get('db'),
                req.params.note_id,
                noteToUpdate
            )
            .then(numRowsAffected => {
                res.status(204).end()
            })
            .catch(next)
    })

module.exports = noteRouter;