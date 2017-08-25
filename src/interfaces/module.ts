/**
 * Interface for modules of this application
 */
interface Module {

    /**
     * The init method should initialize the module and start all of the
     * services it provides.
     */
    init: () => void
}
