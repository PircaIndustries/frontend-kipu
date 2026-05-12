/**
 * ncr Entity
 * Represents the report of the errors in the constructions
 */
export class ncr{
    /**
     *
     * @param id
     * @param ncrTitle
     * @param ncrDescription
     * @param ncrDate
     * @param specialty
     * @param severityLevel
     */
    constructor(id, ncrTitle, ncrDescription, ncrDate = new Date().toISOString(), specialty, severityLevel){
        this.id = id;
        this.ncrTitle = ncrTitle;
        this.ncrDescription = ncrDescription;
        this.specialty = specialty;
        this.severityLevel = severityLevel;
    }
}