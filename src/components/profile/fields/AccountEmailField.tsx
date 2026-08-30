import { Link } from "react-router-dom";
import { FloatingInput } from "@/components/ui/field";
import { useAuth } from "@/contexts/AuthContext";

/**
 * Email di contatto in sola lettura: coincide sempre con l'email di accesso
 * dell'account. È il database a propagarla su `profiles.contact_email`, quindi
 * il client non la scrive mai. Su un profilo tutelato l'account è del tutore,
 * quindi questo è già il suo indirizzo.
 */
export const AccountEmailField = ({
  note = true,
  manageLink = false,
}: {
  note?: boolean;
  /** Mostra il link alla pagina dove si cambia l'email di accesso. */
  manageLink?: boolean;
}) => {
  const { user } = useAuth();

  return (
    <div>
      <FloatingInput
        label="Email di contatto"
        type="email"
        value={user?.email ?? ""}
        disabled
        onChange={() => undefined}
      />
      {note && (
        <p className="mt-2 text-[13px] text-field-label">
          Coincide con l'email di accesso.{" "}
          {manageLink ? (
            <Link to="/talent/aggiorna-accesso" className="dc-link-action">
              Modifica email o password
            </Link>
          ) : (
            "Si aggiorna dalla pagina dei dati di accesso."
          )}
        </p>
      )}
    </div>
  );
};

export default AccountEmailField;
