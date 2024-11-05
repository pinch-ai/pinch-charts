import React from "react";
import SankeyChart from "./SankeyGraph";

const fasvaa = {
	id: 1,
	count: 10000,
	name: "All Events",
	tooltip: "10K | 100%",
	color: "#2763EC",
	distribution: [
		{
			id: 1,
			name: "Allow",
			count: 8500,
			tooltip: "5k | 50%",
			color: "#34C759",
			delta: null,
			distribution: [
				{
					id: 5,
					name: "3508-Action",
					count: 1000,
					tooltip: "2500 | 100%",
					color: "#258b3e",
					delta: null,
					distribution: null,
				},
				{
					id: 5,
					name: "3508-Action",
					count: 1500,
					tooltip: "2500 | 100%",
					color: "#258b3e",
					delta: null,
					distribution: null,
				},
				{
					id: 5,
					name: "3508-Action",
					count: 1500,
					tooltip: "2500 | 100%",
					color: "#258b3e",
					delta: null,
					distribution: null,
				},
				{
					id: 5,
					name: "3508-Action",
					count: 500,
					tooltip: "2500 | 100%",
					color: "#258b3e",
					delta: null,
					distribution: null,
				},
				{
					id: 5,
					name: "3508-Action",
					count: 500,
					tooltip: "2500 | 100%",
					color: "#258b3e",
					delta: null,
					distribution: null,
				},
				{
					id: 5,
					name: "3508-Action",
					count: 1500,
					tooltip: "2500 | 100%",
					color: "#258b3e",
					delta: null,
					distribution: null,
				},
				{
					id: 5,
					name: "3508-Action",
					count: 1000,
					tooltip: "2500 | 100%",
					color: "#258b3e",
					delta: null,
					distribution: null,
				},
				{
					id: 5,
					name: "3508-Action",
					count: 1000,
					tooltip: "2500 | 100%",
					color: "#258b3e",
					delta: null,
					distribution: null,
				},
			],
		},
		{
			id: 3,
			name: "Review",
			count: 1000,
			tooltip: "2.5k | 25%",
			color: "#FF9500",
			delta: null,
			distribution: [
				{
					id: 5,
					name: "3508-Action",
					count: 250,
					tooltip: "2500 | 100%",
					color: "#b26800",
					delta: null,
					distribution: null,
				},
				{
					id: 5,
					name: "3508-Action",
					count: 250,
					tooltip: "2500 | 100%",
					color: "#b26800",
					delta: null,
					distribution: null,
				},
				{
					id: 5,
					name: "3508-Action",
					count: 250,
					tooltip: "2500 | 100%",
					color: "#b26800",
					delta: null,
					distribution: null,
				},
				{
					id: 5,
					name: "3508-Action",
					count: 250,
					tooltip: "2500 | 100%",
					color: "#b26800",
					delta: null,
					distribution: null,
				},
			],
		},
		{
			id: 4,
			name: "Deny",
			count: 500,
			tooltip: "2.5k | 25%",
			color: "#FF3B30",
			delta: null,
			distribution: [
				{
					id: 5,
					name: "3508-Action",
					count: 250,
					tooltip: "2500 | 100%",
					color: "#b22922",
					delta: null,
					distribution: null,
				},
				{
					id: 5,
					name: "3508-Action",
					count: 250,
					tooltip: "2500 | 100%",
					color: "#b22922",
					delta: null,
					distribution: null,
				},
			],
		},
	],
};

function App() {
	return (
		<div
			style={{
				display: "flex",
				justifyContent: "center",
				marginTop: 20,
				flexDirection: "column",
				alignItems: "center",
				backgroundImage:
					"url(https://s3-alpha-sig.figma.com/img/bc43/3f9d/bcc7db442711c8c6a57116e6fab2674a?Expires=1730073600&Key-Pair-Id=APKAQ4GOSFWCVNEHN3O4&Signature=olGAHRuDwoPSfRAagLaSLkxP9v7B-c7A0QWAJpaSr99VtTj9JGHaIPIh3aNGGuxVJ2lvTzKm2tnDPCTtruKXL~or6RLa6LUaguqrHuffIPgu-soZcrwl2QIO2oXydGWLSJmogSdNx2XLsg5IZqIgp6wSOE4LImgoqMyIHXFlANP~J0-MNM76~9Rskdm6Dl3zuJZx~CxtS4pL61O483HwP3um3Aap~HCBhYwQU7vPHpzpvYRDPtV7Q7hqKlMdiqUQFtc4p9af1L-Bt5GOVWiyzygp8Pcq-LoUIWfWZ6z43rte1BlVseJSR6u-Bx6PW~RfVvMb~HHxsPx2EUbGreBfYw__)",
			}}
		>
			<SankeyChart data={fasvaa} />
		</div>
	);
}

export default App;
