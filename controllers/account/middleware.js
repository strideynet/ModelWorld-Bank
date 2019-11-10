const accountWithPerms = (permLevel) => {
  return (req, res, next) => {
    try {
      const account = req.account

      if (!account) {
        const e = new Error('account does not exist')
        e.code = 404

        throw e
      }

      if (permLevel) {
        if (!(account.users[req.decoded.name] >= permLevel || req.decoded.admin === true)) {
          const e = new Error('You do not have permission to access this account')
          e.code = 403

          throw e
        }
      }
      next()
    } catch (e) {
      next(e)
    }
  }
}

module.exports = {
  accountWithPerms
}
