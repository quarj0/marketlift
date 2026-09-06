# Optional hardware evidence — design, implementation deferred

The seller can optionally share a device diagnostic report. Buyers see what the report says, which fields agree with the listing, when it was supplied, and what could not be checked. This is evidence about a report, not a certificate that an item is genuine, safe, undamaged or identical to the item eventually delivered.

The first supported categories should be SSDs and HDDs. Other product categories need their own evidence formats and checks; a generic authenticity score would suggest more certainty than the available evidence supports. Implementation follows the other fixes, as requested.

## Seller flow

1. After saving a listing, offer “Adicionar relatório de diagnóstico” with a short explanation and a skip action. Posting remains available without a report.
2. Start with a smartctl JSON upload. Instructions explain installation from the official project/distribution, choosing the correct device, and generating a read-only report such as `smartctl -x -j /dev/DEVICE`. Required permissions and device names vary by OS. Never run a seller's uploaded script on the server, automatically execute shell commands, or imply that the website can inspect hardware attached to the seller's computer.
3. Parse and preview the report before submission. Redact serial numbers, WWNs, hostnames and unrelated device paths. Show model, firmware, interface, reported capacity and available health indicators, with individual opt-outs for public health details.
4. Ask the seller to confirm that the report belongs to the listed device. Store that declaration separately from the machine-extracted values.
5. Show the resulting evidence panel and allow removal. If the listing's model, capacity or other relevant specifications change, mark the evidence as needing an update.

A future signed desktop helper could collect only approved read-only commands with an explicit device picker and preview. An upload is simpler to distribute and maintain first. A server-issued nonce can associate a submission with a listing and session, but it does not prove a user-edited report came from that device. Browser permissions cannot substitute for device attestation.

## Buyer presentation

Suggested label: **“Relatório de hardware fornecido”**, with the submission date. Avoid a green “genuine”, “verified hardware” seal or a probability of authenticity.

The expanded panel has four parts:

- **Reported by the device/tool:** model, firmware, capacity and supported health data, including the tool version.
- **Compared with this listing:** field-by-field matches, differences or unavailable values. A capacity comparison allows decimal/binary unit differences; unknown/OEM model strings stay unresolved.
- **Seller declaration:** the seller says the report belongs to this item.
- **Limits:** reports can be edited; device firmware can misreport identity/capacity; USB bridges and OEM hardware may expose unexpected identifiers; passing health indicators do not prove authenticity or future reliability.

For the Samsung SSD example, a different controller/vendor/model string should surface as a difference to investigate, with the raw relevant fields, not an automatic “counterfeit” verdict. Full-capacity write/read tests are potentially destructive and are excluded from the initial flow. Manufacturer utilities or purchase evidence can be additional, separately labelled evidence later.

## Proposed implementation contract

Future model `ListingHardwareEvidence`: listing, seller, report type/version, parser version, listing-specification fingerprint, submitted timestamp, seller declaration timestamp, sanitised extracted fields, comparison results, processing status and withdrawn timestamp. Keep any original report in private quarantine with an explicit short retention policy; never attach raw reports to the public upload bucket. Store a report digest for duplicate detection, but do not treat it as proof of authenticity.

Future authenticated endpoints: create upload, preview extraction, confirm publication, withdraw evidence and list a seller's evidence. Public listing responses expose only the sanitised summary. Enforce ownership, upload size/depth limits, format allowlists, per-seller quotas and parser time limits. Parse JSON as data; reject executable archives and unknown formats. Use idempotent jobs and audit changes.

Suggested processing statuses: awaiting report, processing, available, unsupported format, could not read, withdrawn and listing changed. “Available” means a report was parsed, not that the hardware passed an authenticity test. Do not let a parsing failure lower a seller's trust rating or suppress a listing automatically.

## Acceptance tests before release

Cover SATA/NVMe and common USB bridge formats, missing fields, malformed and oversized JSON, unusual vendor/model strings, unit conversions, edited reports, repeated reports, listing edits, seller ownership, private report access, serial-number redaction, failed jobs and evidence withdrawal. Review the buyer wording with users to check that the label is not understood as an authenticity guarantee.

Implementation references: smartmontools exposes identity and JSON output in its [smartctl source and option documentation](https://www.smartmontools.org/static/doxygen/smartctl_8cpp_source.html); NVMe tooling exposes controller/namespace information through [NVMe-CLI](https://nvmexpress.org/open-source-nvme-ssd-management-utility-nvme-command-line-interface-nvme-cli/). These tools provide diagnostic and reported identity data; they do not establish a marketplace authenticity guarantee.
