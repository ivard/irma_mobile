package irmagobridge

import (
	"encoding/base64"
	"github.com/privacybydesign/irmago/irmaclient"
	"log"
)

type RecoveryLoadBackupAction struct {
	BackupData string
}

type RecoveryLoadPhraseAction struct {
	RecoveryPhrase []string
	Proceed        bool
}

type RecoveryPinAction struct {
	Pin     string
	Proceed bool
}

type RecoveryHandler struct {
	pin            chan *string
	backup         []byte
	recoveryPhrase chan []string
}

func (rh *RecoveryHandler) Init() {
	rh.pin = make(chan *string, 1)
	rh.recoveryPhrase = make(chan []string, 1)
}

func (rh *RecoveryHandler) RecoveryCancelled() {
	log.Println("Recovery cancelled")
	sendAction(&OutgoingAction{
		"type":   "IrmaClient.RecoveryStatus",
		"status": "cancelled",
	})
}

func (rh *RecoveryHandler) RequestPin(remainingAttempts int, callback irmaclient.PinHandler) {
	log.Println("PIN requested for recovery")
	sendAction(&OutgoingAction{
		"type":              "IrmaClient.RecoveryStatus",
		"status":            "requestPin",
		"remainingAttempts": remainingAttempts,
	})

	p, ok := <-rh.pin
	if p == nil {
		callback(ok, "")
	} else {
		callback(ok, *p)
	}
}

func (rh *RecoveryHandler) RequestPhrase(callback irmaclient.PhraseHandler) {
	log.Println("Recovery phrase requested")
	sendAction(&OutgoingAction{
		"type":   "IrmaClient.RecoveryStatus",
		"status": "requestPhrase",
	})
	phrase, ok := <-rh.recoveryPhrase
	if phrase == nil {
		callback(ok, nil)
	} else {
		callback(ok, phrase)
	}
}

func (rh *RecoveryHandler) ShowPhrase(phrase []string) {
	log.Println(phrase)
	sendRecoveryPhrase(phrase)
}

func (rh *RecoveryHandler) OutputBackup(backup []byte) {
	log.Println("Output backup file")
	sendAction(&OutgoingAction{
		"type":   "IrmaClient.RecoveryBackup",
		"backup": base64.StdEncoding.EncodeToString(backup),
	})
}

func (rh *RecoveryHandler) GetBackup(callback irmaclient.BackupHandler) {
	// Backup is set at initialization, so no channel is needed for now
	callback(true, rh.backup)
}

func (rh *RecoveryHandler) RecoveryPinOk() {
	// No intermediate result sent for now
}

func (rh *RecoveryHandler) RecoveryInitSuccess() {
	log.Println("Recovery init successful")
	rh.Close()
	sendRecoveryIsConfigured()
}

func (rh *RecoveryHandler) RecoveryPerformed(newClient *irmaclient.Client) {
	log.Println("Recovery was successful")
	rh.Close()
	if newClient != nil {
		client = newClient
		sendCredentials()
		sendEnrollmentStatus()
		sendPreferences()
		sendRecoveryDone()
	}
}

func (rh *RecoveryHandler) RecoveryBlocked(duration int) {
	//TODO: Handle wrong PINs
	sendAction(&OutgoingAction{
		"type":              "IrmaClient.RecoveryStatus",
		"status":            "blocked",
		"remainingAttempts": 0,
		"blocked":           duration,
	})
}

func (rh *RecoveryHandler) RecoveryError(err error) {
	log.Println("Error in recovery")
	log.Println(err)
	rh.Close()
	sendAction(&OutgoingAction{
		"type":         "IrmaClient.RecoveryError",
		"errorStatus":  "error",
		"errorMessage": err.Error(),
	})
}

func (rh *RecoveryHandler) RecoveryPhraseIncorrect(err error) {
	log.Println("Phrase was incorrect:", err.Error())
	sendAction(&OutgoingAction{
		"type":         "IrmaClient.RecoveryError",
		"errorStatus":  "warning",
		"errorMessage": err.Error(),
	})
}

func (rh *RecoveryHandler) Close() {
	close(rh.recoveryPhrase)
	close(rh.pin)
}
