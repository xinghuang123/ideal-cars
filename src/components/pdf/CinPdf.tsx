import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
} from "@react-pdf/renderer";
import type { Car } from "@/types/car";

const styles = StyleSheet.create({
  page: {
    padding: 36,
    fontSize: 9,
    fontFamily: "Helvetica",
    color: "#1E2A3A",
  },
  title: {
    fontSize: 16,
    fontFamily: "Helvetica-Bold",
    marginBottom: 4,
    color: "#1E2A3A",
  },
  subtitle: {
    fontSize: 9,
    color: "#5b6570",
    marginBottom: 14,
  },
  section: {
    marginTop: 12,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: "#cbd0d6",
  },
  sectionTitle: {
    fontSize: 11,
    fontFamily: "Helvetica-Bold",
    marginBottom: 6,
    color: "#1E2A3A",
  },
  row: {
    flexDirection: "row",
    marginBottom: 3,
  },
  cellLabel: {
    width: "40%",
    fontFamily: "Helvetica-Bold",
    color: "#5b6570",
  },
  cellValue: {
    width: "60%",
  },
  twoCol: {
    flexDirection: "row",
    gap: 16,
  },
  col: {
    flex: 1,
  },
  footer: {
    position: "absolute",
    bottom: 24,
    left: 36,
    right: 36,
    fontSize: 7,
    color: "#5b6570",
    textAlign: "center",
  },
});

function Field({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.row}>
      <Text style={styles.cellLabel}>{label}</Text>
      <Text style={styles.cellValue}>{value}</Text>
    </View>
  );
}

const fmtBool = (v: boolean) => (v ? "Yes" : "No");
const fmtCurrency = (v: number) =>
  `$${v.toLocaleString("en-NZ", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

export default function CinPdf({ car }: { car: Car }) {
  const cin = car.cin;
  if (!cin) {
    return (
      <Document>
        <Page size="A4" style={styles.page}>
          <Text style={styles.title}>Consumer Information Notice</Text>
          <Text>No CIN data available for this vehicle.</Text>
        </Page>
      </Document>
    );
  }

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <Text style={styles.title}>Consumer Information Notice</Text>
        <Text style={styles.subtitle}>
          {car.year} {car.make} {car.model} · Stock #{car.stockNumber}
        </Text>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Trader Information</Text>
          <Field label="Name" value={cin.trader.name} />
          <Field label="Address" value={cin.trader.address} />
          <Field
            label="Registered trader"
            value={fmtBool(cin.trader.isRegisteredTrader)}
          />
          <Field
            label="Registration #"
            value={cin.trader.traderRegistrationNumber || "—"}
          />
          {cin.trader.phone && (
            <Field label="Phone" value={cin.trader.phone} />
          )}
          {cin.trader.contactPerson && (
            <Field label="Contact" value={cin.trader.contactPerson} />
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Sale Information</Text>
          <View style={styles.twoCol}>
            <View style={styles.col}>
              <Field label="Cash price" value={fmtCurrency(cin.cashPrice)} />
            </View>
            <View style={styles.col}>
              <Field
                label="Security interest"
                value={cin.securityInterest || "None"}
              />
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Vehicle Identification</Text>
          <View style={styles.twoCol}>
            <View style={styles.col}>
              <Field label="VIN" value={cin.vin || "—"} />
              <Field
                label="Engine capacity"
                value={`${cin.engineCapacityCc} cc`}
              />
              <Field
                label="Odometer"
                value={`${cin.odometer.toLocaleString("en-NZ")} ${cin.odometerUnit}`}
              />
            </View>
            <View style={styles.col}>
              <Field
                label="Radio 88-108 MHz"
                value={fmtBool(cin.hasRadio88to108)}
              />
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>WoF / Licence / Registration</Text>
          <View style={styles.twoCol}>
            <View style={styles.col}>
              <Field label="Has WoF / CoF" value={fmtBool(cin.hasWofOrCof)} />
              <Field label="WoF / CoF expiry" value={cin.wofOrCofExpiry || "—"} />
              <Field
                label="Has vehicle licence"
                value={fmtBool(cin.hasVehicleLicence)}
              />
              <Field
                label="Licence expiry"
                value={cin.vehicleLicenceExpiry || "—"}
              />
            </View>
            <View style={styles.col}>
              <Field label="Registered" value={fmtBool(cin.isRegistered)} />
              <Field label="Rego plate" value={cin.regoPlate || "—"} />
              <Field
                label="NZ first registered"
                value={cin.nzFirstRegistered || "—"}
              />
              <Field label="Re-registered" value={fmtBool(cin.isReregistered)} />
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Fuel & RUC</Text>
          <View style={styles.twoCol}>
            <View style={styles.col}>
              <Field label="Operating fuel" value={cin.operatingFuelType} />
            </View>
            <View style={styles.col}>
              <Field label="RUC applies" value={fmtBool(cin.rucApplies)} />
              <Field
                label="Outstanding RUC"
                value={fmtBool(cin.outstandingRuc)}
              />
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Import Information</Text>
          <View style={styles.twoCol}>
            <View style={styles.col}>
              <Field
                label="Overseas first registered"
                value={cin.overseasFirstRegistered || "—"}
              />
              <Field
                label="Country last registered"
                value={cin.countryLastRegistered || "—"}
              />
            </View>
            <View style={styles.col}>
              <Field
                label="Imported as damaged"
                value={fmtBool(cin.importedAsDamaged)}
              />
            </View>
          </View>
        </View>

        <Text style={styles.footer}>
          Generated by Ideal Cars · idealcarsnzltd@gmail.com · 020 4190 7335
        </Text>
      </Page>
    </Document>
  );
}
