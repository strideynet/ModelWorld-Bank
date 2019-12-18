const mongoose = require('mongoose')
const shortid = require('shortid') // Smarter, shorter IDs than the default MongoDB ones
const moment = require('moment')

const schema = new mongoose.Schema({
  _id: { type: String, default: shortid.generate },
  name: String,
  description: String,
  public: Boolean,
  verified: Boolean,
  wages: [{ type: String, ref: 'Wage' }], // wages: ['fdsuf923', 'ushdushfui', 'uishdfuis']
  created: { type: Date, default: Date.now },
  users: mongoose.Schema.Types.Mixed, // users: {'strideynet': NUM} NUM: 0 -> Blocked/Removed, 1 -> Read, 2 -> Read/Write, 3 -> Owner
  lastPaid: { type: Date, default: Date.now },
  accountType: { type: String, ref: 'AccountType', autopopulate: true }
}, { collection: 'accounts' })

/**
 * calculateBalance
 * @callback
 * @return Promise
 */
schema.methods.calculateBalance = function () {
  const { Transaction } = mongoose.models
  return new Promise((resolve, reject) => {
    Transaction.find({ to: this._id }).sort('-created').populate('from').exec((err, tos) => {
      if (err) {
        return reject(err)
      }

      const balance = {}

      tos.forEach(function (element) {
        if (balance[element.currency] === undefined) {
          balance[element.currency] = element.amount
        } else {
          balance[element.currency] += element.amount
        }
      })

      Transaction.find({ from: this._id }).sort('-created').populate('to').exec((err, froms) => {
        if (err) {
          return reject(err)
        }

        froms.forEach(function (element) {
          if (balance[element.currency] === undefined) {
            balance[element.currency] = -element.amount
          } else {
            balance[element.currency] -= element.amount
          }
        })

        const transactions = tos.concat(froms)

        return resolve({ transactions, balance })
      })
    })
  })
}

schema.methods.fetchWageRequests = function (callback) {
  const { WageRequest } = mongoose.models
  WageRequest.find({ account: this._id }).populate('wage').exec(function (err, wageRequests) {
    if (err) {
      return callback(err)
    }
    callback(null, wageRequests)
  })
}

const calculateTaxDue = (annualGross) => {
  const taxBrackets = [
    {
      topEnd: 12000,
      rate: 0
    },
    {
      topEnd: 45000,
      rate: 0.2
    },
    {
      topEnd: 150000,
      rate: 0.4
    },
    {
      topEnd: Infinity,
      rate: 0.45
    }
  ]
  let unallocated = annualGross
  let taxDueAnnually = 0

  for (const taxBracket of taxBrackets) {
    if (unallocated >= taxBracket.topEnd) {
      taxDueAnnually += taxBracket.topEnd * taxBracket.rate
      unallocated -= taxBracket.topEnd
    } else {
      taxDueAnnually += unallocated * taxBracket.rate
      break
    }
  }

  return taxDueAnnually
}

schema.methods.getSalaries = async function () {
  const incomePerCurrency = {}
  let wages = []
  if (wages.length === 0) {
    wages = ['*unemployed*']
  }

  await this.populate('wages').execPopulate()
  for (const wage of wages) {
    if (incomePerCurrency[wage.currency]) {
      incomePerCurrency[wage.currency] += wage.value
    } else {
      incomePerCurrency[wage.currency] = wage.value
    }
  }

  return incomePerCurrency
}

schema.methods.getPropertyIncomes = async function () {
  const incomePerCurrency = {}

  return incomePerCurrency
}

const roundCurrency = val => Math.floor(val * 100) / 100
schema.methods.handlePaymentJob = async function () {
  const { Transaction } = mongoose.models

  // get annual values
  const salaries = await this.getSalaries()
  const propertyIncomes = await this.getPropertyIncomes()

  // get multiplier values
  const yearsSinceLastWage = moment().diff(this.lastPaid, 'years', true) * 10

  const transactions = []
  for (const currency of [...Object.keys(salaries), ...Object.keys(propertyIncomes)]) {
    const grossAnnual = roundCurrency(salaries[currency] + propertyIncomes[currency])
    const taxDue = roundCurrency(calculateTaxDue(grossAnnual))
    const netAnnual = grossAnnual - taxDue
    const periodNet = roundCurrency(netAnnual * yearsSinceLastWage)

    const meta = {
      gross: grossAnnual,
      salary: salaries[currency],
      property: propertyIncomes[currency],
      tax: taxDue
    }

    transactions.push({
      to: this._id,
      from: '*economy*',
      description: 'Income',
      amount: periodNet,
      currency: currency,
      type: 'INCOME',
      authoriser: 'SYSTEM',
      meta
    })
  }

  await Transaction.create(transactions)
  await this.update({ lastPaid: Date.now() }).exec()
  await this.save()
}

schema.plugin(require('mongoose-autopopulate'))

const model = mongoose.model('Account', schema)

module.exports = model
