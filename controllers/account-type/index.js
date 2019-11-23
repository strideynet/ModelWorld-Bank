const router = (require('express')).Router()

const AccountType = require('../../models/account-type.js')

const middleware = require('../../middleware')
const utils = require('../../utils')

const create = async (req, res, next) => {
  try {
    const newAccountType = await AccountType.create({
      ...req.body
    })

    res.status(200).json(newAccountType)
  } catch (err) {
    next(err)
  }
}

const findAll = async (req, res, next) => {
  try {
    const accountTypes = await AccountType.find({}).exec()
    res.status(200).json(accountTypes)
  } catch (e) {
    next(e)
  }
}

const whitelistedFieldsForUpdate = ['fields here']
const updateById = async (req, res, next) => {
  try {
    for (const field in req.body) {
      const value = req.body[field]
      if (!whitelistedFieldsForUpdate.includes(field)) {
        const e = new Error('Forbidden to modify protected field')
        e.code = 403

        throw e
      }

      req.accountType[field] = value
    }

    await req.accountType.save()

    res.status(200).json(req.accountType)
  } catch (err) {
    next(err)
  }
}

router.get('/', findAll)
router.post('/', middleware.ensureAdmin, create)
router.put('/:accountTypeId', middleware.ensureAdmin, updateById)

router.param('accountTypeId', utils.generateParamMiddleware(AccountType, 'accountType'))

module.exports = {
  router
}
