// Dette er en enkel database-service for å håndtere adresse-statuser
// I en ekte implementasjon ville dette vært koblet til en faktisk database

class DatabaseService {
    constructor() {
        // Simulerer en database-tilkobling
        this.addressStatuses = new Map();
        this.apartments = new Map();
    }

    // Lagre status for en adresse
    async saveAddressStatus(address, status, position, apartmentNumber = null) {
        try {
            // Simulerer en database-operasjon
            const addressData = {
                address,
                status,
                position,
                apartmentNumber,
                timestamp: new Date().toISOString(),
            };
            
            const key = apartmentNumber ? `${address}-${apartmentNumber}` : address;
            this.addressStatuses.set(key, addressData);
            console.log('Status lagret:', addressData);
            return true;
        } catch (error) {
            console.error('Database feil:', error);
            throw new Error('Kunne ikke lagre status');
        }
    }

    // Hent status for en adresse
    async getAddressStatus(address, apartmentNumber = null) {
        try {
            const key = apartmentNumber ? `${address}-${apartmentNumber}` : address;
            return this.addressStatuses.get(key) || null;
        } catch (error) {
            console.error('Feil ved henting av status:', error);
            return null;
        }
    }

    // Hent alle adresse-statuser
    async getAllAddressStatuses() {
        try {
            return Array.from(this.addressStatuses.values());
        } catch (error) {
            console.error('Feil ved henting av alle statuser:', error);
            return [];
        }
    }

    // Legg til leiligheter for en bygning
    async addApartmentsToBuilding(address, apartments) {
        try {
            this.apartments.set(address, apartments);
            console.log('Leiligheter lagt til for:', address);
            return true;
        } catch (error) {
            console.error('Feil ved lagring av leiligheter:', error);
            return false;
        }
    }

    // Hent leiligheter for en bygning
    async getApartmentsForBuilding(address) {
        try {
            return this.apartments.get(address) || [];
        } catch (error) {
            console.error('Feil ved henting av leiligheter:', error);
            return [];
        }
    }

    // Sjekk om en adresse er en leilighetsbygning
    async isApartmentBuilding(address) {
        try {
            const apartments = await this.getApartmentsForBuilding(address);
            return apartments.length > 0;
        } catch (error) {
            console.error('Feil ved sjekk av bygningstype:', error);
            return false;
        }
    }
}

// Eksempel på leilighetsdata
const exampleApartments = {
    'Tøyengata 47E': [
        { number: 'H0101', floor: 1 },
        { number: 'H0102', floor: 1 },
        { number: 'H0201', floor: 2 },
        { number: 'H0202', floor: 2 },
        { number: 'H0301', floor: 3 },
        { number: 'H0302', floor: 3 },
        { number: 'L0101', floor: 1 },
        { number: 'L0102', floor: 1 }
    ]
};

// Create and export a single instance of the database service
const dbService = new DatabaseService();

// Initialize example apartments
dbService.addApartmentsToBuilding('Tøyengata 47E', exampleApartments['Tøyengata 47E']);

export {
    dbService,
    // Export individual methods for convenience
    saveAddressStatus: dbService.saveAddressStatus.bind(dbService),
    getAllAddressStatuses: dbService.getAllAddressStatuses.bind(dbService),
    isApartmentBuilding: dbService.isApartmentBuilding.bind(dbService),
    getApartmentsForBuilding: dbService.getApartmentsForBuilding.bind(dbService)
};
