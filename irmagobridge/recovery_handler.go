package irmagobridge

import (
	"github.com/privacybydesign/irmago/irmaclient"
	"log"
)

type RecoveryAction struct {
	BackupData     string
	RecoveryPhrase []string
}

type RecoveryHandler struct {
	newClient      chan *irmaclient.Client
	backup         []byte
	recoveryPhrase []string
}

func New() *RecoveryHandler {
	return &RecoveryHandler{
		newClient:      make(chan *irmaclient.Client),
		backup:         nil,
		recoveryPhrase: nil,
	}
}

func (rh *RecoveryHandler) RecoveryCancelled() {
	rh.newClient <- nil
}

func (rh *RecoveryHandler) RequestPin(remainingAttempts int, callback irmaclient.PinHandler) {
	callback(true, "12345")
}

func (rh *RecoveryHandler) RequestPhrase(callback irmaclient.PhraseHandler) {
	log.Println(rh.recoveryPhrase)
	callback(true, rh.recoveryPhrase)
}

func (rh *RecoveryHandler) ShowPhrase(phrase []string) {
}

func (rh *RecoveryHandler) OutputBackup(backup []byte) {

}

func (rh *RecoveryHandler) GetBackup(callback irmaclient.BackupHandler) {
	callback(true, rh.backup)
}

func (rh *RecoveryHandler) RecoveryPinOk() {
}

func (rh *RecoveryHandler) RecoveryInitSuccess() {
	log.Println("Recovery init successful")
}

func (rh *RecoveryHandler) RecoveryPerformed(newClient *irmaclient.Client) {
	log.Println("Recovery was successful")
	rh.newClient <- newClient
}

func (rh *RecoveryHandler) RecoveryBlocked(duration int) {
	rh.newClient <- nil
}

func (rh *RecoveryHandler) RecoveryError(err error) {
	log.Println("Error in recovery")
	log.Println(err)
	rh.newClient <- nil
}
