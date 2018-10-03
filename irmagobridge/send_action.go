package irmagobridge

import (
	"encoding/json"

	"github.com/go-errors/errors"
	"github.com/privacybydesign/irmago/irmaclient"
)

type OutgoingAction map[string]interface{}

func sendConfiguration() {
	sendAction(&OutgoingAction{
		"type":              "IrmaClient.Configuration",
		"irmaConfiguration": client.Configuration,
		"sentryDSN":         irmaclient.SentryDSN,
	})
}

func sendPreferences() {
	sendAction(&OutgoingAction{
		"type":        "IrmaClient.Preferences",
		"preferences": client.Preferences,
	})
}

func sendCredentials() {
	sendAction(&OutgoingAction{
		"type":        "IrmaClient.Credentials",
		"credentials": client.CredentialInfoList(),
	})
}

func sendEnrollmentStatus() {
	sendAction(&OutgoingAction{
		"type":        "IrmaClient.EnrollmentStatus",
		"managers":    client.UnenrolledSchemeManagers(),
		"hasKeyshare": (len(client.EnrolledSchemeManagers()) != 0),
	})
}

func sendRecoveryDone() {
	sendAction(&OutgoingAction{
		"type": "IrmaClient.RecoveryDone",
	})
}

func sendRecoveryPhrase(phrase []string) {
	sendAction(&OutgoingAction{
		"type":   "IrmaClient.RecoveryShowPhrase",
		"phrase": phrase,
	})
}

func sendRecoveryIsConfigured() {
	sendAction(&OutgoingAction{
		"type":         "IrmaClient.RecoveryStatus",
		"isConfigured": client.RecoveryIsConfigured(),
	})
}

func sendAction(action *OutgoingAction) {
	jsonBytes, err := json.Marshal(action)
	if err != nil {
		logError(errors.Errorf("Cannot marshal action: %s", err))
		return
	}

	bridge.SendEvent("irmago", string(jsonBytes))
}
