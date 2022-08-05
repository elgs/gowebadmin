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

      getHostJSON(host, server) {
         console.log(JSON.stringify(host, null, 2));
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
         const data = await api.post('/api/server/', server);
         console.log(data);
      }

      deleteServer(server) {
         const serverIndex = this.servers.findIndex(s => s === server);
         this.servers.splice(serverIndex, 1);
      }

      getServerJSON(server) {
         console.log(JSON.stringify(server, null, 2));
      }

      // servers
      async applyServers() {
         const data = await api.post('/api/servers/', this.servers);
         console.log(data);
      }

      getServersJSON() {
         console.log(JSON.stringify(this.servers, null, 2));
      }

      // toggle host header
      toggleHostHeader(event, host) {
         const panel = host.getDom().querySelector('.host-panel');
         if (panel.style.maxHeight) {
            panel.style.maxHeight = null;
            host.uiActive = false;
         } else {
            panel.style.maxHeight = panel.scrollHeight + `px`;
            host.uiActive = true;
         }
      }
   }
);
