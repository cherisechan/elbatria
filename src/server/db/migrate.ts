import { db } from './index'
import { migrate } from 'drizzle-orm/neon-http/migrator'

const main = async () => {
    try {
        await migrate(db, {
            migrationsFolder: 'src/server/db/migrations'
        })
    } catch (err) {
        console.error(err)
        process.exit(1)
    }
}

main()