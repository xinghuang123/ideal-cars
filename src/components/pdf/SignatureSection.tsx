import { Text, View, StyleSheet } from "@react-pdf/renderer";

// Trader/buyer confirmation strip, modeled on the official CIN form:
// banner, two confirmation columns with signature + date lines, and a
// "see over" pointer to the back page.

const s = StyleSheet.create({
  wrap: {
    marginTop: 16,
  },
  banner: {
    backgroundColor: "#1E2A3A",
    color: "#ffffff",
    fontFamily: "Helvetica-Bold",
    fontSize: 9,
    paddingVertical: 5,
    paddingHorizontal: 8,
    textAlign: "center",
  },
  cols: {
    flexDirection: "row",
    borderWidth: 1,
    borderColor: "#1E2A3A",
    borderTopWidth: 0,
  },
  col: {
    flex: 1,
    paddingVertical: 6,
    paddingHorizontal: 8,
  },
  colLeft: {
    borderRightWidth: 1,
    borderRightColor: "#1E2A3A",
  },
  heading: {
    fontFamily: "Helvetica-Bold",
    fontSize: 8.5,
    marginBottom: 4,
  },
  nameRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    marginBottom: 4,
  },
  namePrefix: {
    fontSize: 8,
  },
  nameLine: {
    flex: 1,
    borderBottomWidth: 0.75,
    borderBottomColor: "#1E2A3A",
    marginHorizontal: 4,
    minHeight: 11,
    justifyContent: "flex-end",
  },
  nameValue: {
    fontSize: 8.5,
    textAlign: "center",
    paddingBottom: 1,
  },
  nameSuffix: {
    fontSize: 7,
    color: "#5b6570",
  },
  statement: {
    fontSize: 7.5,
    lineHeight: 1.35,
  },
  sigRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    marginTop: 16,
  },
  sigLabel: {
    fontSize: 8,
  },
  sigLine: {
    flex: 1.4,
    borderBottomWidth: 0.75,
    borderBottomColor: "#1E2A3A",
    marginLeft: 4,
    marginRight: 10,
    minHeight: 11,
  },
  dateLine: {
    flex: 1,
    borderBottomWidth: 0.75,
    borderBottomColor: "#1E2A3A",
    marginLeft: 4,
    minHeight: 11,
  },
  seeOver: {
    textAlign: "center",
    fontFamily: "Helvetica-Bold",
    fontSize: 8,
    color: "#1E2A3A",
    marginTop: 5,
  },
});

export default function SignatureSection({
  documentNoun,
  traderName,
}: {
  /** "notice" for the CIN, "guide" for the BCG — used in the wording. */
  documentNoun: "notice" | "guide";
  /** Pre-printed trader name; the buyer name line stays blank for handwriting. */
  traderName?: string;
}) {
  return (
    <View style={s.wrap} wrap={false}>
      <Text style={s.banner}>
        If you buy this motor vehicle, the trader MUST give you a copy of this{" "}
        {documentNoun} to keep.
      </Text>
      <View style={s.cols}>
        <View style={[s.col, s.colLeft]}>
          <Text style={s.heading}>Trader confirmation</Text>
          <View style={s.nameRow}>
            <Text style={s.namePrefix}>I</Text>
            <View style={s.nameLine}>
              {traderName ? (
                <Text style={s.nameValue}>{traderName}</Text>
              ) : null}
            </View>
            <Text style={s.nameSuffix}>(name of trader)</Text>
          </View>
          <Text style={s.statement}>
            Have supplied to the buyer a copy or electronic version of this{" "}
            {documentNoun}, including a copy of the information on the back of
            this {documentNoun}.
          </Text>
          <View style={s.sigRow}>
            <Text style={s.sigLabel}>Trader Signature:</Text>
            <View style={s.sigLine} />
            <Text style={s.sigLabel}>Date:</Text>
            <View style={s.dateLine} />
          </View>
        </View>
        <View style={s.col}>
          <Text style={s.heading}>Buyer confirmation</Text>
          <View style={s.nameRow}>
            <Text style={s.namePrefix}>I</Text>
            <View style={s.nameLine} />
            <Text style={s.nameSuffix}>(name of buyer)</Text>
          </View>
          <Text style={s.statement}>
            Have received a copy or electronic version of this {documentNoun},
            including a copy of the information on the back of this{" "}
            {documentNoun}.
          </Text>
          <View style={s.sigRow}>
            <Text style={s.sigLabel}>Buyer Signature:</Text>
            <View style={s.sigLine} />
            <Text style={s.sigLabel}>Date:</Text>
            <View style={s.dateLine} />
          </View>
        </View>
      </View>
      <Text style={s.seeOver}>*SEE OVER FOR FURTHER INFORMATION</Text>
    </View>
  );
}
