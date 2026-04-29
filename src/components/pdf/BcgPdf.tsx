import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
} from "@react-pdf/renderer";
import type { Car, BcgChecklistItem } from "@/types/car";

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
  },
  row: { flexDirection: "row", marginBottom: 3 },
  cellLabel: {
    width: "40%",
    fontFamily: "Helvetica-Bold",
    color: "#5b6570",
  },
  cellValue: { width: "60%" },
  twoCol: { flexDirection: "row", gap: 16 },
  col: { flex: 1 },
  categoryHeader: {
    marginTop: 8,
    marginBottom: 4,
    fontSize: 9,
    fontFamily: "Helvetica-Bold",
    color: "#5b6570",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  itemRow: {
    flexDirection: "row",
    paddingVertical: 2,
    borderBottomWidth: 0.5,
    borderBottomColor: "#e5e7eb",
  },
  itemName: { flex: 2 },
  itemStatus: { flex: 1, fontFamily: "Helvetica-Bold" },
  itemComment: { flex: 2, color: "#5b6570" },
  statusOK: { color: "#15803d" },
  statusAttention: { color: "#b45309" },
  statusNA: { color: "#5b6570" },
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

function statusStyle(status: BcgChecklistItem["status"]) {
  if (status === "OK") return styles.statusOK;
  if (status === "Requires Attention") return styles.statusAttention;
  return styles.statusNA;
}

export default function BcgPdf({ car }: { car: Car }) {
  const bcg = car.bcg;
  if (!bcg) {
    return (
      <Document>
        <Page size="A4" style={styles.page}>
          <Text style={styles.title}>Basic Condition Guide</Text>
          <Text>No BCG data available for this vehicle.</Text>
        </Page>
      </Document>
    );
  }

  // Group checklist by category for ordered display
  const grouped = bcg.checklist.reduce<Record<string, BcgChecklistItem[]>>(
    (acc, item) => {
      acc[item.category] = acc[item.category] ?? [];
      acc[item.category].push(item);
      return acc;
    },
    {},
  );

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <Text style={styles.title}>Basic Condition Guide</Text>
        <Text style={styles.subtitle}>
          {car.year} {car.make} {car.model} · Stock #{car.stockNumber}
        </Text>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Inspection</Text>
          <View style={styles.twoCol}>
            <View style={styles.col}>
              <Field label="Date" value={bcg.inspectionDate} />
              <Field label="Inspector" value={bcg.inspectorName} />
            </View>
            <View style={styles.col}>
              <Field label="Publisher" value={bcg.publisherName} />
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Checklist</Text>
          {Object.entries(grouped).map(([category, items]) => (
            <View key={category}>
              <Text style={styles.categoryHeader}>{category}</Text>
              {items.map((item, i) => (
                <View key={i} style={styles.itemRow}>
                  <Text style={styles.itemName}>{item.item}</Text>
                  <Text style={[styles.itemStatus, statusStyle(item.status)]}>
                    {item.status}
                  </Text>
                  <Text style={styles.itemComment}>{item.comment ?? ""}</Text>
                </View>
              ))}
            </View>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Tyre Depths (mm)</Text>
          <View style={styles.twoCol}>
            <View style={styles.col}>
              <Field
                label="Front left"
                value={String(bcg.tyreDepths.frontLeft)}
              />
              <Field
                label="Front right"
                value={String(bcg.tyreDepths.frontRight)}
              />
            </View>
            <View style={styles.col}>
              <Field
                label="Rear left"
                value={String(bcg.tyreDepths.rearLeft)}
              />
              <Field
                label="Rear right"
                value={String(bcg.tyreDepths.rearRight)}
              />
              {bcg.tyreDepths.spare !== undefined && (
                <Field label="Spare" value={String(bcg.tyreDepths.spare)} />
              )}
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Interior Condition</Text>
          <View style={styles.twoCol}>
            <View style={styles.col}>
              <Field label="Seats" value={bcg.interiorCondition.seats} />
              <Field label="Carpets" value={bcg.interiorCondition.carpets} />
            </View>
            <View style={styles.col}>
              <Field label="Panels" value={bcg.interiorCondition.panels} />
              <Field
                label="Dashboard"
                value={bcg.interiorCondition.dashboard}
              />
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Engine</Text>
          <View style={styles.twoCol}>
            <View style={styles.col}>
              <Field
                label="Timing mechanism"
                value={bcg.engineTimingMechanism}
              />
            </View>
            <View style={styles.col}>
              <Field
                label="Cam belt replaced"
                value={
                  bcg.camBeltReplaced === null
                    ? "N/A"
                    : bcg.camBeltReplaced
                      ? "Yes"
                      : "No"
                }
              />
              {bcg.camBeltReplacedKms !== null && (
                <Field
                  label="Cam belt replaced at"
                  value={`${bcg.camBeltReplacedKms.toLocaleString("en-NZ")} km`}
                />
              )}
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Conditions & Comments</Text>
          <Field label="Road conditions" value={bcg.roadConditions} />
          <Field label="Body conditions" value={bcg.bodyConditions} />
          {bcg.bodyComments && (
            <Field label="Body comments" value={bcg.bodyComments} />
          )}
          {bcg.underCarriageComments && (
            <Field
              label="Under-carriage"
              value={bcg.underCarriageComments}
            />
          )}
          {bcg.generalComments && (
            <Field label="General" value={bcg.generalComments} />
          )}
        </View>

        <Text style={styles.footer}>
          Generated by Ideal Cars · idealcarsnzltd@gmail.com · 020 4190 7335
        </Text>
      </Page>
    </Document>
  );
}
