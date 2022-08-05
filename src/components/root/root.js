import LWElement from './../../lib/lw-element.js';
import ast from './ast.js';
import { api } from '../../services/api-client.js';

customElements.define('gowebadmin-root',
   class extends LWElement {  // LWElement extends HTMLElement
      constructor() {
         super(ast);
      }

      // derived from LWElement
      async domReady() {
         this.servers = await api.get('/api/servers/');
         this.json = JSON.stringify(this.servers, null, 2);
         this.update();
      }

      getNewHost() {
         return {
            name: 'example.com',
            path: "/path/to/webroot",
            cert_path: "/path/to/certfile",
            key_path: "/path/to/keyfile",
         };
      }

      newHost(server) {
         server.hosts ??= [];
         const newHost = this.getNewHost();
         server.hosts.push(newHost);
         setTimeout(() => {
            const hostPanel = newHost.getDom().querySelector('.host-panel');
            hostPanel.style.maxHeight = hostPanel.scrollHeight + 'px';
         });
      }

      deleteHost(host, server) {
         const hostIndex = server.hosts.findIndex(h => h === host);
         server.hosts.splice(hostIndex, 1);
      }

      // server
      newServer() {
         this.servers ??= [];
         const server = {
            name: 'New Server',
            type: 'https',
            listen: '[::]:443',
         };
         this.servers.push(server);
         this.newHost(server);
      }

      async applyServer(server) {
         const serverData = this.getServerJSONData(server, true);
         const data = await api.post('/api/server/', serverData);
         console.log(data);
      }

      deleteServer(server) {
         const serverIndex = this.servers.findIndex(s => s === server);
         this.servers.splice(serverIndex, 1);
      }

      updateServerJSON(server) {
         if (!server.configEditor) {
            server.configEditor = ace.edit(server.getDom().querySelector('.server-json'), {
               mode: 'ace/mode/json',
               theme: 'ace/theme/chrome',
               maxLines: Infinity,
               showPrintMargin: false,
               showGutter: false,
               readOnly: true,
            });
            server.configEditor.renderer.attachToShadowRoot();
         }
         server.configEditor.setValue(JSON.stringify(this.getServerJSONData(server), null, 2), 1);
         this.updateServersJSON();
      }

      toggleServerJSON(server) {
         this.updateServerJSON(server);
         server.showConfigEditor = !server.showConfigEditor;
      }

      // servers
      async applyServers() {
         const serversData = this.servers.map(server => this.getServerJSONData(server));
         const data = await api.post('/api/servers/', serversData);
         console.log(data);
      }

      updateServersJSON() {
         if (!this.configEditor) {
            this.configEditor = ace.edit(this.shadowRoot.querySelector('.servers-json'), {
               mode: 'ace/mode/json',
               theme: 'ace/theme/chrome',
               maxLines: Infinity,
               showPrintMargin: false,
               showGutter: false,
               readOnly: true,
            });
            this.configEditor.renderer.attachToShadowRoot();
         }
         const serversData = this.servers.map(server => this.getServerJSONData(server));
         this.configEditor.setValue(JSON.stringify(serversData, null, 2), 1);
      }

      toggleServersJSON() {
         this.updateServersJSON();
         this.showConfigEditor = !this.showConfigEditor;
      }

      // toggle host header
      toggleHostHeader(host) {
         const panel = host.getDom().querySelector('.host-panel');
         if (panel.style.maxHeight) {
            panel.style.maxHeight = null;
            host.uiActive = false;
         } else {
            panel.style.maxHeight = panel.scrollHeight + `px`;
            host.uiActive = true;
         }
      }

      getServerJSONData(server, withRuntimeId = false) {
         const retServer = {};
         if (withRuntimeId) {
            retServer.runtime_id = server.runtime_id;
         }
         retServer.name = server.name;
         retServer.type = server.type;
         retServer.listen = server.listen;
         retServer.disabled = server.disabled;
         retServer.hosts = server.hosts.map(host => {
            const retHost = {};
            if (withRuntimeId) {
               retHost.runtime_id = host.runtime_id;
            }
            retHost.name = host.name;
            retHost.disabled = host.disabled;
            if (server.type === 'http') {
               if (host.https_redirect_port) {
                  retHost.https_redirect_port = host.https_redirect_port;
               } else {
                  retHost.path = host.path;
                  retHost.disable_dir_listing = host.disable_dir_listing;
               }
            } else if (server.type === 'https') {
               retHost.path = host.path;
               retHost.cert_path = host.cert_path;
               retHost.key_path = host.key_path;
               retHost.disable_dir_listing = host.disable_dir_listing;
            }
            return retHost;
         });
         return retServer;
      }
   }
);
