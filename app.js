/**
 * VMware Cloud Foundation 9.0 - Architecture Builder
 * Complete with vCenter Deployment, Delete Features, and Full Lifecycle Management
 * Version: 2.0
 */

(function () {
    'use strict';

    const MANAGEMENT_COMPONENTS = [
        { name: 'Fleet Manager', icon: '🌐', description: 'Centralized management across VCF instances' },
        { name: 'SDDC Manager', icon: '🎛️', description: 'Lifecycle management for VCF stack' },
        { name: 'NSX Manager Cluster', icon: '🌐', description: 'Software-defined networking control plane' },
        { name: 'NSX Edge', icon: '🔀', description: 'Edge gateway services' },
        { name: 'VCF Automation', icon: '🤖', description: 'Self-service and IaC platform' },
        { name: 'VCF Operations', icon: '📊', description: 'Monitoring and analytics' },
        { name: 'Identity Manager', icon: '🔐', description: 'Authentication and SSO' }
    ];

    const State = {
        theme: 'light',
        domains: [],
        clusters: [],
        vms: [],
        hosts: [],
        managementComponents: [],
        primaryMgmtClusterId: null,
        lastAction: 'None'
    };

    const DOM = {};

    function init() {
        cacheDOMElements();
        attachEventListeners();
        addStyles();
        renderArchitecture();
        console.log('VCF 9.0 Architecture Builder v2.0 initialized');
    }

    function cacheDOMElements() {
        DOM.canvasContent = document.getElementById('canvasContent');
        DOM.clusterStatus = document.getElementById('clusterStatus');
        DOM.lastAction = document.getElementById('lastAction');
        DOM.themeToggle = document.getElementById('themeToggle');
        DOM.userGuideBtn = document.getElementById('userGuideBtn');
        DOM.userGuideModal = document.getElementById('userGuideModal');
        DOM.closeGuide = document.getElementById('closeGuide');
        DOM.vmDeployModal = document.getElementById('vmDeployModal');
        DOM.closeDeployModal = document.getElementById('closeDeployModal');
        DOM.deploymentTargets = document.getElementById('deploymentTargets');
        DOM.cancelDeploy = document.getElementById('cancelDeploy');
        DOM.hostAddModal = document.getElementById('hostAddModal');
        DOM.closeHostModal = document.getElementById('closeHostModal');
        DOM.hostTargets = document.getElementById('hostTargets');
        DOM.cancelAddHost = document.getElementById('cancelAddHost');
        DOM.vMotionModal = document.getElementById('vMotionModal');
        DOM.closeVMotionModal = document.getElementById('closeVMotionModal');
        DOM.vMotionTargets = document.getElementById('vMotionTargets');
        DOM.cancelVMotion = document.getElementById('cancelVMotion');
        DOM.domainCount = document.getElementById('domainCount');
        DOM.clusterCount = document.getElementById('clusterCount');
        DOM.vmCount = document.getElementById('vmCount');
        DOM.hostCount = document.getElementById('hostCount');
        DOM.mgmtComponentCount = document.getElementById('mgmtComponentCount');
        DOM.buildMgmtDomain = document.getElementById('buildMgmtDomain');
        DOM.deployMgmtComponents = document.getElementById('deployMgmtComponents');
        DOM.addWorkloadDomain = document.getElementById('addWorkloadDomain');
        DOM.addCluster = document.getElementById('addCluster');
        DOM.addHost = document.getElementById('addHost');
        DOM.deployVM = document.getElementById('deployVM');
        DOM.simulateHA = document.getElementById('simulateHA');
        DOM.restartHost = document.getElementById('restartHost');
        DOM.enableDRS = document.getElementById('enableDRS');
        DOM.vMotionVM = document.getElementById('vMotionVM');
        DOM.resetAll = document.getElementById('resetAll');
    }

    function attachEventListeners() {
        if (DOM.buildMgmtDomain) DOM.buildMgmtDomain.addEventListener('click', buildManagementDomain);
        if (DOM.deployMgmtComponents) DOM.deployMgmtComponents.addEventListener('click', deployManagementComponents);
        if (DOM.addWorkloadDomain) DOM.addWorkloadDomain.addEventListener('click', addWorkloadDomain);
        if (DOM.addCluster) DOM.addCluster.addEventListener('click', addCluster);
        if (DOM.addHost) DOM.addHost.addEventListener('click', openHostAddModal);
        if (DOM.deployVM) DOM.deployVM.addEventListener('click', openVMDeploymentModal);
        if (DOM.simulateHA) DOM.simulateHA.addEventListener('click', simulateHAFailover);
        if (DOM.restartHost) DOM.restartHost.addEventListener('click', restartESXiHost);
        if (DOM.enableDRS) DOM.enableDRS.addEventListener('click', enableDRS);
        if (DOM.vMotionVM) DOM.vMotionVM.addEventListener('click', openVMotionModal);
        if (DOM.resetAll) DOM.resetAll.addEventListener('click', resetAll);
        if (DOM.themeToggle) DOM.themeToggle.addEventListener('change', toggleTheme);
        if (DOM.userGuideBtn) DOM.userGuideBtn.addEventListener('click', openUserGuide);
        if (DOM.closeGuide) DOM.closeGuide.addEventListener('click', closeUserGuide);
        if (DOM.closeDeployModal) DOM.closeDeployModal.addEventListener('click', closeVMDeploymentModal);
        if (DOM.cancelDeploy) DOM.cancelDeploy.addEventListener('click', closeVMDeploymentModal);
        if (DOM.closeHostModal) DOM.closeHostModal.addEventListener('click', closeHostAddModal);
        if (DOM.cancelAddHost) DOM.cancelAddHost.addEventListener('click', closeHostAddModal);
        if (DOM.closeVMotionModal) DOM.closeVMotionModal.addEventListener('click', closeVMotionModal);
        if (DOM.cancelVMotion) DOM.cancelVMotion.addEventListener('click', closeVMotionModal);

        if (DOM.userGuideModal) {
            DOM.userGuideModal.addEventListener('click', function (e) {
                if (e.target === DOM.userGuideModal) closeUserGuide();
            });
        }

        if (DOM.vmDeployModal) {
            DOM.vmDeployModal.addEventListener('click', function (e) {
                if (e.target === DOM.vmDeployModal) closeVMDeploymentModal();
            });
        }

        if (DOM.hostAddModal) {
            DOM.hostAddModal.addEventListener('click', function (e) {
                if (e.target === DOM.hostAddModal) closeHostAddModal();
            });
        }

        if (DOM.vMotionModal) {
            DOM.vMotionModal.addEventListener('click', function (e) {
                if (e.target === DOM.vMotionModal) closeVMotionModal();
            });
        }

        document.addEventListener('keydown', function (e) {
            if (e.key === 'Escape') {
                if (DOM.userGuideModal && DOM.userGuideModal.classList.contains('active')) closeUserGuide();
                if (DOM.vmDeployModal && DOM.vmDeployModal.classList.contains('active')) closeVMDeploymentModal();
                if (DOM.hostAddModal && DOM.hostAddModal.classList.contains('active')) closeHostAddModal();
                if (DOM.vMotionModal && DOM.vMotionModal.classList.contains('active')) closeVMotionModal();
            }
        });
    }

    function addStyles() {
        var style = document.createElement('style');
        style.textContent = '.mgmt-component-tooltip{position:relative;cursor:help}.mgmt-component-tooltip .tooltip-text{visibility:hidden;opacity:0;position:absolute;bottom:125%;left:50%;transform:translateX(-50%);background:#333;color:#fff;padding:10px 14px;border-radius:0.15rem;font-size:.8rem;white-space:normal;width:250px;z-index:1000;box-shadow:0 4px 12px rgba(0,0,0,.3);transition:opacity .3s,visibility .3s;line-height:1.4}.mgmt-component-tooltip .tooltip-text::after{content:"";position:absolute;top:100%;left:50%;margin-left:-5px;border-width:5px;border-style:solid;border-color:#333 transparent transparent transparent}.mgmt-component-tooltip:hover .tooltip-text{visibility:visible;opacity:1}@keyframes componentDeploy{0%{transform:scale(.5);opacity:0}50%{transform:scale(1.1)}100%{transform:scale(1);opacity:1}}.component-deploying{animation:componentDeploy .6s ease-out forwards}.deploy-target-btn{width:100%;padding:15px;margin-bottom:10px;background:var(--bg-primary);border:2px solid var(--border-color);border-radius:0.15rem;cursor:pointer;transition:all .2s ease;text-align:left;font-size:.95rem}.deploy-target-btn:hover{border-color:var(--accent-primary);background:var(--bg-secondary);transform:translateX(5px)}.deploy-target-btn .target-header{display:flex;align-items:center;gap:10px;font-weight:600;color:var(--text-primary);margin-bottom:8px}.deploy-target-btn .target-info{font-size:.85rem;color:var(--text-secondary);padding-left:30px}.deploy-target-section{margin-bottom:25px}.deploy-target-section h4{color:var(--accent-primary);margin-bottom:12px;font-size:1.1rem}.vm-card{background:var(--bg-primary);border:2px solid var(--border-color);border-radius:0.15rem;padding:15px;margin-bottom:15px;transition:all .2s ease}.vm-card:hover{border-color:var(--accent-primary);box-shadow:0 4px 12px rgba(0,0,0,.1)}.vm-header{display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;padding-bottom:12px;border-bottom:2px solid var(--border-color)}.vm-hosts{display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:10px}.delete-btn{background:#f44336;color:#fff;border:none;padding:6px 12px;border-radius:0.15rem;cursor:pointer;font-size:.8rem;transition:all .2s ease;margin-left:8px}.delete-btn:hover{background:#d32f2f;transform:scale(1.05)}.delete-btn:active{transform:scale(.95)}';
        document.head.appendChild(style);
    }

    // Host Add Modal Functions
    function openHostAddModal() {
        if (!State.domains.length) {
            showNotification('⚠️ Create domain first!', 'warning');
            return;
        }

        if (!State.clusters.length) {
            showNotification('⚠️ Create cluster first!', 'warning');
            return;
        }

        renderHostTargets();
        DOM.hostAddModal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    function closeHostAddModal() {
        if (DOM.hostAddModal) {
            DOM.hostAddModal.classList.remove('active');
            document.body.style.overflow = '';
        }
    }

    function renderHostTargets() {
        if (!DOM.hostTargets) return;

        var html = '';

        State.domains.forEach(function (domain) {
            var domainClusters = State.clusters.filter(function (c) { return c.domainId === domain.id; });

            if (domainClusters.length > 0) {
                var domainIcon = domain.type === 'management' ? '🎛️' : '💼';
                html += '<div class="deploy-target-section"><h4>' + domainIcon + ' ' + domain.name + '</h4>';

                domainClusters.forEach(function (cluster) {
                    var clusterHosts = State.hosts.filter(function (h) { return h.clusterId === cluster.id; });
                    var isPrimary = cluster.id === State.primaryMgmtClusterId;
                    var badge = isPrimary ? ' <span style="background:#2196f3;color:#fff;padding:2px 8px;border-radius:0.15rem;font-size:.7rem;margin-left:8px">MGMT</span>' : '';

                    html += '<button class="deploy-target-btn" onclick="window.addHostToCluster(' + "'" + cluster.id + "','" + domain.id + "'" + ')"><div class="target-header"><span style="font-size:1.3rem">📦</span><span>' + cluster.name + badge + '</span></div><div class="target-info">Currently: ' + clusterHosts.length + ' ESXi host(s)</div></button>';
                });

                html += '</div>';
            }
        });

        if (!html) html = '<p style="text-align:center;padding:40px;color:var(--text-secondary)">No clusters available</p>';
        DOM.hostTargets.innerHTML = html;
    }

    window.addHostToCluster = function (clusterId, domainId) {
        var cluster = State.clusters.find(function (c) { return c.id === clusterId; });
        var domain = State.domains.find(function (d) { return d.id === domainId; });

        if (!cluster || !domain) return;

        var clusterHosts = State.hosts.filter(function (h) { return h.clusterId === clusterId; });
        var hostNum = clusterHosts.length + 1;

        var domainClusters = State.clusters.filter(function (cl) { return cl.domainId === domainId; });
        var clusterIndex = domainClusters.findIndex(function (cl) { return cl.id === clusterId; }) + 1;

        var hostName;

        if (domain.type === 'management') {
            hostName = clusterIndex === 1 ? 'ESXi-Mgmt-0' + hostNum : 'ESXi-Mgmt-C' + clusterIndex + '-0' + hostNum;
        } else {
            var wlNum = domain.name.match(/\d+/)[0];
            hostName = domainClusters.length === 1 ? 'ESXi-WL' + wlNum + '-0' + hostNum : 'ESXi-WL' + wlNum + '-C' + clusterIndex + '-0' + hostNum;
        }

        State.hosts.push({
            id: 'host-' + Date.now(),
            clusterId: clusterId,
            name: hostName,
            status: 'running'
        });

        updateStats();
        updateStatus('Host added');
        updateLastAction('Added ' + hostName + ' to ' + cluster.name);
        showNotification('✅ ' + hostName + ' added to ' + cluster.name, 'success');
        closeHostAddModal();
        renderArchitecture();
    };

    // Delete Host Function
    window.confirmDeleteHost = function (hostId) {
        var host = State.hosts.find(function (h) { return h.id === hostId; });
        if (!host) return;

        var cluster = State.clusters.find(function (c) { return c.id === host.clusterId; });
        var clusterHosts = State.hosts.filter(function (h) { return h.clusterId === host.clusterId; });

        // Validation: Cannot delete last host
        if (clusterHosts.length === 1) {
            showNotification('❌ Cannot delete last host in cluster!', 'error');
            return;
        }

        var hostVMs = State.vms.filter(function (vm) { return vm.hostId === hostId; });

        if (hostVMs.length > 0) {
            if (confirm('⚠️ ' + host.name + ' has ' + hostVMs.length + ' VM(s).\n\nAuto-migrate VMs to other hosts?')) {
                migrateVMsOffHost(hostId);
                setTimeout(function () {
                    deleteHost(hostId);
                }, 1500);
            }
        } else {
            if (confirm('Delete ' + host.name + ' from ' + cluster.name + '?')) {
                deleteHost(hostId);
            }
        }
    };

    function migrateVMsOffHost(hostId) {
        var hostVMs = State.vms.filter(function (vm) { return vm.hostId === hostId; });
        var host = State.hosts.find(function (h) { return h.id === hostId; });
        var otherHosts = State.hosts.filter(function (h) {
            return h.clusterId === host.clusterId && h.id !== hostId && h.status === 'running';
        });

        if (!otherHosts.length) return;

        updateStatus('Migrating VMs...');
        showNotification('🔄 Migrating ' + hostVMs.length + ' VM(s) off ' + host.name, 'info');

        hostVMs.forEach(function (vm, idx) {
            var targetHost = otherHosts[idx % otherHosts.length];
            vm.hostId = targetHost.id;
        });

        updateStatus('Migration complete');
        showNotification('✅ VMs migrated successfully', 'success');
        renderArchitecture();
    }

    function deleteHost(hostId) {
        var host = State.hosts.find(function (h) { return h.id === hostId; });
        State.hosts = State.hosts.filter(function (h) { return h.id !== hostId; });
        updateStats();
        updateStatus('Host deleted');
        updateLastAction('Deleted ' + host.name);
        showNotification('✅ ' + host.name + ' deleted', 'success');
        renderArchitecture();
    }

    // Delete Cluster Function
    window.confirmDeleteCluster = function (clusterId) {
        var cluster = State.clusters.find(function (c) { return c.id === clusterId; });
        if (!cluster) return;

        // Cannot delete primary management cluster
        if (cluster.id === State.primaryMgmtClusterId) {
            showNotification('❌ Cannot delete primary management cluster!', 'error');
            return;
        }

        var clusterHosts = State.hosts.filter(function (h) { return h.clusterId === clusterId; });
        var clusterHostIds = clusterHosts.map(function (h) { return h.id; });
        var clusterVMs = State.vms.filter(function (vm) { return clusterHostIds.indexOf(vm.hostId) !== -1; });

        if (clusterVMs.length > 0) {
            showNotification('❌ Migrate ' + clusterVMs.length + ' VM(s) first!', 'error');
            return;
        }

        if (confirm('Delete ' + cluster.name + ' and all ' + clusterHosts.length + ' host(s)?')) {
            deleteCluster(clusterId);
        }
    };

    function deleteCluster(clusterId) {
        var cluster = State.clusters.find(function (c) { return c.id === clusterId; });
        State.hosts = State.hosts.filter(function (h) { return h.clusterId !== clusterId; });
        State.clusters = State.clusters.filter(function (c) { return c.id !== clusterId; });
        updateStats();
        updateStatus('Cluster deleted');
        updateLastAction('Deleted ' + cluster.name);
        showNotification('✅ ' + cluster.name + ' deleted', 'success');
        renderArchitecture();
    }

    // Delete Domain Function
    window.confirmDeleteDomain = function (domainId) {
        var domain = State.domains.find(function (d) { return d.id === domainId; });
        if (!domain) return;

        // Cannot delete management domain
        if (domain.type === 'management') {
            showNotification('❌ Cannot delete Management Domain!', 'error');
            return;
        }

        var domainClusters = State.clusters.filter(function (c) { return c.domainId === domainId; });
        var domainHosts = State.hosts.filter(function (h) {
            return domainClusters.some(function (c) { return c.id === h.clusterId; });
        });
        var domainHostIds = domainHosts.map(function (h) { return h.id; });
        var domainVMs = State.vms.filter(function (vm) { return domainHostIds.indexOf(vm.hostId) !== -1; });

        if (domainVMs.length > 0) {
            showNotification('❌ Migrate ' + domainVMs.length + ' VM(s) first!', 'error');
            return;
        }

        if (confirm('Delete ' + domain.name + ' with:\n- ' + domainClusters.length + ' cluster(s)\n- ' + domainHosts.length + ' host(s)\n- Associated vCenter?')) {
            deleteDomain(domainId);
        }
    };

    function deleteDomain(domainId) {
        var domain = State.domains.find(function (d) { return d.id === domainId; });

        updateStatus('Deleting domain...');
        showNotification('🔄 Starting domain deletion workflow...', 'info');

        setTimeout(function () {
            // Remove vCenter for this domain
            State.managementComponents = State.managementComponents.filter(function (mc) {
                return mc.workloadDomainId !== domainId;
            });

            // Delete all hosts
            var domainClusters = State.clusters.filter(function (c) { return c.domainId === domainId; });
            domainClusters.forEach(function (cluster) {
                State.hosts = State.hosts.filter(function (h) { return h.clusterId !== cluster.id; });
            });

            // Delete all clusters
            State.clusters = State.clusters.filter(function (c) { return c.domainId !== domainId; });

            // Delete domain
            State.domains = State.domains.filter(function (d) { return d.id !== domainId; });

            updateStats();
            updateStatus('Domain deleted');
            updateLastAction('Deleted ' + domain.name);
            showNotification('✅ ' + domain.name + ' deleted successfully', 'success');
            renderArchitecture();
        }, 2000);
    }

    // vMotion Modal Functions
    function openVMotionModal() {
        if (!State.vms.length) {
            showNotification('⚠️ No VMs to migrate!', 'warning');
            return;
        }

        renderVMotionTargets();
        DOM.vMotionModal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    function closeVMotionModal() {
        if (DOM.vMotionModal) {
            DOM.vMotionModal.classList.remove('active');
            document.body.style.overflow = '';
        }
    }

    function renderVMotionTargets() {
        if (!DOM.vMotionTargets) return;

        var html = '';
        var hasVMs = false;

        State.clusters.forEach(function (cluster) {
            var clusterHosts = State.hosts.filter(function (h) {
                return h.clusterId === cluster.id && h.status === 'running';
            });

            if (clusterHosts.length < 2) return;

            var clusterHostIds = clusterHosts.map(function (h) { return h.id; });
            var clusterVMs = State.vms.filter(function (vm) {
                return clusterHostIds.indexOf(vm.hostId) !== -1;
            });

            if (!clusterVMs.length) return;

            hasVMs = true;
            var domain = State.domains.find(function (d) { return d.id === cluster.domainId; });

            html += '<div class="deploy-target-section"><h4>' + (domain ? domain.name + ' - ' : '') + cluster.name + '</h4>';

            clusterVMs.forEach(function (vm) {
                var currentHost = State.hosts.find(function (h) { return h.id === vm.hostId; });
                var targetHosts = clusterHosts.filter(function (h) { return h.id !== vm.hostId; });

                html += '<div class="vm-card"><div class="vm-header"><div style="display:flex;align-items:center;gap:10px"><span style="font-size:1.5rem">💻</span><div><div style="font-weight:600;font-size:1.05rem">' + vm.name + '</div><div style="font-size:.85rem;color:var(--text-secondary)">Currently on: ' + (currentHost ? currentHost.name : 'Unknown') + '</div></div></div></div>';

                html += '<div style="margin-top:12px;font-size:.9rem;font-weight:600;color:var(--text-secondary);margin-bottom:10px">Select target host:</div>';
                html += '<div class="vm-hosts">';

                targetHosts.forEach(function (host) {
                    var hostVMs = State.vms.filter(function (v) { return v.hostId === host.id; });
                    html += '<button class="deploy-target-btn" onclick="window.executeVMotion(' + "'" + vm.id + "','" + host.id + "','" + vm.name + "','" + host.name + "'" + ')" style="margin:0"><div class="target-header" style="margin-bottom:5px"><span style="font-size:1.1rem">🖥️</span><span>' + host.name + '</span></div><div class="target-info" style="padding-left:0;font-size:.8rem">Currently: ' + hostVMs.length + ' VM(s)</div></button>';
                });

                html += '</div></div>';
            });

            html += '</div>';
        });

        if (!hasVMs) {
            html = '<p style="text-align:center;padding:40px;color:var(--text-secondary)">No VMs available for vMotion<br><small>Need at least 2 hosts in a cluster</small></p>';
        }

        DOM.vMotionTargets.innerHTML = html;
    }

    window.executeVMotion = function (vmId, targetHostId, vmName, targetHostName) {
        var vm = State.vms.find(function (v) { return v.id === vmId; });
        if (!vm) return;

        closeVMotionModal();
        updateStatus('vMotion in progress');
        updateLastAction('vMotion ' + vmName + ' to ' + targetHostName);
        showNotification('🔀 vMotion: ' + vmName + ' → ' + targetHostName, 'info');

        setTimeout(function () {
            vm.hostId = targetHostId;
            updateStatus('vMotion complete');
            showNotification('✅ vMotion complete: ' + vmName + ' now on ' + targetHostName, 'success');
            renderArchitecture();
        }, 1800);
    };

    // VM Deployment Modal Functions
    function openVMDeploymentModal() {
        if (State.hosts.length === 0) {
            showNotification('⚠️ Add ESXi hosts first!', 'warning');
            return;
        }

        var eligible = State.clusters.filter(function (c) { return c.id !== State.primaryMgmtClusterId; });
        if (eligible.length === 0) {
            showNotification('⚠️ Add workload cluster first!', 'warning');
            return;
        }

        renderDeploymentTargets();
        DOM.vmDeployModal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    function closeVMDeploymentModal() {
        if (DOM.vmDeployModal) {
            DOM.vmDeployModal.classList.remove('active');
            document.body.style.overflow = '';
        }
    }

    function renderDeploymentTargets() {
        if (!DOM.deploymentTargets) return;

        var html = '';
        var eligible = State.clusters.filter(function (c) { return c.id !== State.primaryMgmtClusterId; });

        State.domains.forEach(function (domain) {
            var clusters = eligible.filter(function (c) { return c.domainId === domain.id; });

            if (clusters.length > 0) {
                html += '<div class="deploy-target-section"><h4>' + domain.name + '</h4>';

                clusters.forEach(function (cluster) {
                    var hosts = State.hosts.filter(function (h) { return h.clusterId === cluster.id && h.status === 'running'; });

                    if (hosts.length > 0) {
                        html += '<button class="deploy-target-btn" onclick="window.deployToCluster(' + "'" + cluster.id + "','" + cluster.name + "'" + ')"><div class="target-header"><span style="font-size:1.3rem">📦</span><span>' + cluster.name + ' (DRS)</span></div><div class="target-info">DRS will choose from ' + hosts.length + ' host(s)</div></button>';

                        hosts.forEach(function (host) {
                            var vms = State.vms.filter(function (v) { return v.hostId === host.id; });
                            html += '<button class="deploy-target-btn" onclick="window.deployToHost(' + "'" + host.id + "','" + host.name + "'" + ')" style="margin-left:20px"><div class="target-header"><span style="font-size:1.2rem">🖥️</span><span>' + host.name + '</span></div><div class="target-info">Running ' + vms.length + ' VM(s)</div></button>';
                        });
                    }
                });
                html += '</div>';
            }
        });

        if (!html) html = '<p style="text-align:center;padding:40px;color:var(--text-secondary)">No workload clusters available</p>';
        DOM.deploymentTargets.innerHTML = html;
    }

    window.deployToCluster = function (clusterId, clusterName) {
        var hosts = State.hosts.filter(function (h) { return h.clusterId === clusterId && h.status === 'running'; });
        if (!hosts.length) return;

        var best = hosts.reduce(function (a, b) {
            var aVMs = State.vms.filter(function (v) { return v.hostId === a.id; }).length;
            var bVMs = State.vms.filter(function (v) { return v.hostId === b.id; }).length;
            return aVMs < bVMs ? a : b;
        });

        deployTo(best.id, best.name, clusterName + ' (DRS)');
    };

    window.deployToHost = function (hostId, hostName) {
        deployTo(hostId, hostName, 'Manual');
    };

    function deployTo(hostId, hostName, method) {
        var num = State.vms.length + 1;
        State.vms.push({ id: 'vm-' + Date.now(), hostId: hostId, name: 'VM-' + num, status: 'running' });
        updateStats();
        updateStatus('VM deployed');
        updateLastAction('VM-' + num + ' on ' + hostName);
        showNotification('✅ VM-' + num + ' on ' + hostName, 'success');
        closeVMDeploymentModal();
        renderArchitecture();
    }

    function renderArchitecture() {
        if (!DOM.canvasContent) return;

        var h = '<div class="canvas-view"><h2>🏛️ VCF 9.0 Architecture</h2>';

        if (!State.domains.length) {
            h += '<div style="padding:40px;text-align:center;background:linear-gradient(135deg,#fff3e0,#ffe0b2);border-radius:0.15rem;margin:30px 0;border:2px dashed var(--accent-primary)"><div style="font-size:4rem;margin-bottom:20px">🏗️</div><h3 style="color:var(--accent-primary);margin-bottom:15px;font-size:1.5rem">Ready to Build</h3><p style="color:var(--text-secondary);font-size:1.1rem">Click <strong>Build Mgmt Domain</strong></p></div>';
        } else {
            h += '<div style="background:linear-gradient(135deg,#e3f2fd,#bbdefb);padding:30px;border-radius:0.15rem;margin:20px 0"><div style="display:flex;align-items:center;gap:15px;margin-bottom:25px"><div style="font-size:2.5rem">🌐</div><div><h3 style="margin:0;color:#1976d2;font-size:1.5rem">VCF Fleet</h3><p style="margin:5px 0 0 0;color:#555;font-size:.95rem">Private Cloud Infrastructure</p></div></div>';

            State.domains.forEach(function (d) {
                var isMgmt = d.type === 'management';
                var bg = isMgmt ? 'linear-gradient(135deg,#fff3e0,#ffe0b2)' : 'linear-gradient(135deg,#e8f5e9,#c8e6c9)';
                var bc = isMgmt ? '#ff9800' : '#4caf50';
                var ic = isMgmt ? '🎛️' : '💼';

                h += '<div style="background:' + bg + ';padding:25px;border-radius:0.15rem;margin-bottom:20px;border-left:6px solid ' + bc + ';box-shadow:0 4px 12px rgba(0,0,0,.1)"><div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:20px"><h4 style="margin:0;color:#333;font-size:1.3rem;display:flex;align-items:center;gap:10px"><span style="font-size:1.8rem">' + ic + '</span><span>' + d.name + '</span></h4><div style="display:flex;gap:8px;align-items:center"><span style="background:#fff;padding:6px 12px;border-radius:0.15rem;font-size:.85rem;font-weight:600;color:' + bc + '">' + d.type.toUpperCase() + '</span>';

                // Add delete button for workload domains
                if (!isMgmt) {
                    h += '<button class="delete-btn" onclick="window.confirmDeleteDomain(' + "'" + d.id + "'" + ')">🗑️ Delete</button>';
                }

                h += '</div></div>';

                var dClusters = State.clusters.filter(function (c) { return c.domainId === d.id; });
                if (dClusters.length) {
                    h += '<div style="margin-top:15px">';

                    dClusters.forEach(function (cl) {
                        var isPrimary = cl.id === State.primaryMgmtClusterId;
                        h += '<div style="background:rgba(255,255,255,.7);padding:20px;border-radius:0.15rem;margin-bottom:10px;border:1px solid rgba(0,0,0,.1)"><div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:15px"><div style="font-weight:600;color:#333;display:flex;align-items:center;gap:8px"><span style="font-size:1.2rem">📦</span><span>' + cl.name + '</span></div><div style="display:flex;gap:8px;align-items:center">';

                        if (isPrimary) {
                            h += '<span style="background:#2196f3;color:#fff;padding:4px 10px;border-radius:0.15rem;font-size:.75rem;font-weight:600">MANAGEMENT</span>';
                        } else if (isMgmt) {
                            h += '<span style="background:#4caf50;color:#fff;padding:4px 10px;border-radius:0.15rem;font-size:.75rem;font-weight:600">WORKLOAD</span>';
                        }

                        // Add delete button for non-primary clusters
                        if (!isPrimary) {
                            h += '<button class="delete-btn" onclick="window.confirmDeleteCluster(' + "'" + cl.id + "'" + ')">🗑️ Delete</button>';
                        }

                        h += '</div></div>';

                        if (isPrimary && State.managementComponents.length) {
                            h += '<div style="background:#f5f5f5;padding:15px;border-radius:0.15rem;margin-bottom:15px;border-left:4px solid #2196f3"><div style="font-size:.9rem;font-weight:600;color:#2196f3;margin-bottom:12px">VCF Components:</div><div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(180px,1fr));gap:10px">';
                            State.managementComponents.forEach(function (mc) {
                                h += '<div class="mgmt-component-tooltip component-deploying" style="background:#fff;padding:12px;border-radius:0.15rem;box-shadow:0 2px 8px rgba(0,0,0,.1);border-left:3px solid #2196f3"><div style="display:flex;align-items:center;gap:8px;font-size:.85rem;font-weight:600;color:#333"><span style="font-size:1.3rem">' + mc.icon + '</span><span>' + mc.name + '</span></div><div class="tooltip-text">' + mc.description + '</div></div>';
                            });
                            h += '</div></div>';
                        }

                        if (isMgmt && !isPrimary && State.managementComponents.length) {
                            h += '<div style="background:#e8f5e9;padding:12px;border-radius:0.15rem;margin-bottom:15px;border-left:4px solid #4caf50"><div style="font-size:.85rem;color:#2e7d32"><span style="font-size:1.2rem">💼</span> <strong>Consolidated:</strong> Workload cluster</div></div>';
                        }

                        var cHosts = State.hosts.filter(function (ho) { return ho.clusterId === cl.id; });
                        if (cHosts.length) {
                            h += '<div style="display:flex;gap:10px;flex-wrap:wrap">';
                            cHosts.forEach(function (ho) {
                                var st = ho.status || 'running';
                                var stC = st === 'running' ? '#4caf50' : st === 'failed' ? '#f44336' : '#ff9800';
                                var stI = st === 'running' ? '✅' : st === 'failed' ? '❌' : '🔄';
                                h += '<div style="background:#fff;padding:12px 14px;border-radius:0.15rem;font-size:.85rem;box-shadow:0 2px 6px rgba(0,0,0,.1);border-left:3px solid ' + stC + ';min-width:150px"><div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:8px"><div style="display:flex;align-items:center;gap:6px"><span>' + stI + '</span><span style="font-weight:600">🖥️ ' + ho.name + '</span></div><button class="delete-btn" style="margin:0;padding:4px 8px;font-size:.7rem" onclick="window.confirmDeleteHost(' + "'" + ho.id + "'" + ')">🗑️</button></div>';

                                var hVMs = State.vms.filter(function (v) { return v.hostId === ho.id; });
                                if (hVMs.length) {
                                    h += '<div style="padding-top:8px;border-top:1px solid #eee"><div style="font-size:.75rem;color:#666;margin-bottom:6px">VMs (' + hVMs.length + '):</div><div style="display:flex;flex-wrap:wrap;gap:4px">';
                                    hVMs.forEach(function (vm) {
                                        h += '<span style="background:#e3f2fd;padding:4px 8px;border-radius:0.15rem;font-size:.7rem">💻 ' + vm.name + '</span>';
                                    });
                                    h += '</div></div>';
                                }
                                h += '</div>';
                            });
                            h += '</div>';
                        }
                        h += '</div>';
                    });
                    h += '</div>';
                }
                h += '</div>';
            });

            h += '</div><div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:15px;margin-top:30px">';
            [
                { l: 'Domains', v: State.domains.length, i: '🏛️', c: '#2196f3' },
                { l: 'Clusters', v: State.clusters.length, i: '📦', c: '#4caf50' },
                { l: 'Hosts', v: State.hosts.length, i: '🖥️', c: '#ff9800' },
                { l: 'VMs', v: State.vms.length, i: '💻', c: '#9c27b0' },
                { l: 'Mgmt', v: State.managementComponents.length, i: '🎛️', c: '#f44336' }
            ].forEach(function (s) {
                h += '<div style="background:var(--bg-primary);padding:15px;border-radius:0.15rem;text-align:center;box-shadow:0 2px 8px rgba(0,0,0,.1)"><div style="font-size:2rem;margin-bottom:8px">' + s.i + '</div><div style="font-size:2rem;font-weight:700;color:' + s.c + ';margin-bottom:5px">' + s.v + '</div><div style="color:var(--text-secondary);font-size:.85rem;font-weight:500">' + s.l + '</div></div>';
            });
            h += '</div>';
        }

        h += '</div>';
        DOM.canvasContent.innerHTML = h;
    }

    function buildManagementDomain() {
        if (State.domains.length) {
            showNotification('⚠️ Already exists!', 'warning');
            return;
        }
        var did = 'domain-' + Date.now();
        State.domains.push({ id: did, type: 'management', name: 'Management Domain' });
        var cid = 'cluster-' + Date.now();
        State.clusters.push({ id: cid, domainId: did, name: 'Management-Cluster-01' });
        State.primaryMgmtClusterId = cid;
        for (var i = 1; i <= 3; i++) {
            State.hosts.push({ id: 'host-' + Date.now() + '-' + i, clusterId: cid, name: 'ESXi-Mgmt-0' + i, status: 'running' });
        }
        updateStats();
        updateStatus('Domain built');
        updateLastAction('Built Management Domain');
        showNotification('✅ Management Domain created', 'success');
        renderArchitecture();
    }

    function deployManagementComponents() {
        if (!State.domains.length) {
            showNotification('⚠️ Build domain first!', 'warning');
            return;
        }
        if (State.managementComponents.length) {
            showNotification('⚠️ Already deployed!', 'warning');
            return;
        }
        updateStatus('Deploying...');
        showNotification('📦 Deploying components...', 'info');

        // Deploy management vCenter first
        State.managementComponents.push({
            id: 'vcenter-mgmt-' + Date.now(),
            name: 'vCenter-Mgmt',
            icon: '⚙️',
            description: 'vCenter Server for Management Domain',
            type: 'vcenter',
            domainType: 'management'
        });

        // Deploy NSX Manager Cluster (3 nodes)
        for (var i = 1; i <= 3; i++) {
            State.managementComponents.push({
                id: 'nsx-mgmt-' + i + '-' + Date.now(),
                name: 'NSX-Mgmt-0' + i,
                icon: '🌐',
                description: 'NSX Manager ' + i + ' for Management Domain',
                type: 'nsx',
                domainType: 'management'
            });
        }

        // Deploy other components
        var d = 3200;
        MANAGEMENT_COMPONENTS.forEach(function (c, i) {
            setTimeout(function () {
                State.managementComponents.push({
                    id: 'mc-' + Date.now(),
                    name: c.name,
                    icon: c.icon,
                    description: c.description,
                    type: 'component'
                });
                updateStats();
                showNotification('✅ ' + c.name, 'success');
                renderArchitecture();
                if (i === MANAGEMENT_COMPONENTS.length - 1) {
                    setTimeout(function () { updateStatus('Components deployed'); }, 500);
                }
            }, d);
            d += 800;
        });

        updateStats();
        renderArchitecture();
    }

    function addWorkloadDomain() {
        if (!State.domains.length) {
            showNotification('⚠️ Build mgmt domain first!', 'warning');
            return;
        }

        if (!State.managementComponents.length) {
            showNotification('⚠️ Deploy mgmt components first!', 'warning');
            return;
        }

        var n = State.domains.filter(function (d) { return d.type === 'workload'; }).length + 1;
        var did = 'domain-' + Date.now();

        State.domains.push({ id: did, type: 'workload', name: 'Workload Domain ' + n });

        var cid = 'cluster-' + Date.now();
        State.clusters.push({ id: cid, domainId: did, name: 'WL' + n + '-Cluster-01' });

        for (var i = 1; i <= 2; i++) {
            State.hosts.push({ id: 'host-' + Date.now() + '-' + i, clusterId: cid, name: 'ESXi-WL' + n + '-0' + i, status: 'running' });
        }

        // Deploy vCenter for workload domain (in management cluster)
        State.managementComponents.push({
            id: 'vcenter-wl' + n + '-' + Date.now(),
            name: 'vCenter-WL' + n,
            icon: '⚙️',
            description: 'vCenter Server for Workload Domain ' + n,
            type: 'vcenter',
            domainType: 'workload',
            workloadDomainId: did
        });

        // Deploy NSX for first workload domain
        if (n === 1) {
            for (var j = 1; j <= 3; j++) {
                State.managementComponents.push({
                    id: 'nsx-wl-' + j + '-' + Date.now(),
                    name: 'NSX-WL-0' + j,
                    icon: '🌐',
                    description: 'NSX Manager ' + j + ' for Workload Domains',
                    type: 'nsx',
                    domainType: 'workload',
                    workloadDomainId: did
                });
            }
        }

        updateStats();
        updateStatus('Workload domain added');
        updateLastAction('Added Workload Domain ' + n + ' (with vCenter)');
        showNotification('✅ Workload Domain ' + n + ' (vCenter deployed)', 'success');
        renderArchitecture();
    }

    function addCluster() {
        if (!State.domains.length) {
            showNotification('⚠️ Create domain first!', 'warning');
            return;
        }

        var d = State.domains[State.domains.length - 1];
        var cs = State.clusters.filter(function (c) { return c.domainId === d.id; });
        var clusterNum = cs.length + 1;
        var cid = 'cluster-' + Date.now();

        var clusterName;
        var hostPrefix;

        if (d.type === 'management') {
            clusterName = 'Management-Cluster-0' + clusterNum;
            hostPrefix = clusterNum === 1 ? 'ESXi-Mgmt-' : 'ESXi-Mgmt-C' + clusterNum + '-';
        } else {
            var wlNum = d.name.match(/\d+/)[0];
            clusterName = 'WL' + wlNum + '-Cluster-0' + clusterNum;
            hostPrefix = 'ESXi-WL' + wlNum + '-C' + clusterNum + '-';
        }

        State.clusters.push({ id: cid, domainId: d.id, name: clusterName });
        State.hosts.push({ id: 'host-' + Date.now(), clusterId: cid, name: hostPrefix + '01', status: 'running' });

        updateStats();
        updateStatus('Cluster added');
        updateLastAction('Added ' + clusterName);
        showNotification('✅ ' + clusterName, 'success');
        renderArchitecture();
    }

    function simulateHAFailover() {
        var rh = State.hosts.filter(function (h) { return h.status === 'running'; });
        if (rh.length < 2) {
            showNotification('⚠️ Need 2+ hosts!', 'warning');
            return;
        }
        var f = rh[Math.floor(Math.random() * rh.length)];
        f.status = 'failed';
        var fv = State.vms.filter(function (v) { return v.hostId === f.id; });
        var oh = State.hosts.filter(function (h) { return h.status === 'running' && h.id !== f.id; });
        updateStatus('HA triggered');
        showNotification('⚠️ HA failover!', 'warning');
        renderArchitecture();
        setTimeout(function () {
            fv.forEach(function (v, i) { v.hostId = oh[i % oh.length].id; });
            updateStatus('HA complete');
            showNotification('✅ HA complete!', 'success');
            renderArchitecture();
        }, 2500);
    }

    function restartESXiHost() {
        var rh = State.hosts.filter(function (h) { return h.status === 'running'; });
        if (rh.length < 2) {
            showNotification('⚠️ Need 2+ hosts!', 'warning');
            return;
        }
        var h = rh[Math.floor(Math.random() * rh.length)];
        var hv = State.vms.filter(function (v) { return v.hostId === h.id; });
        updateStatus('Migrating VMs');
        showNotification('🔄 Migrating...', 'info');
        setTimeout(function () {
            var oh = State.hosts.filter(function (x) { return x.status === 'running' && x.id !== h.id; });
            hv.forEach(function (v, i) { v.hostId = oh[i % oh.length].id; });
            renderArchitecture();
            setTimeout(function () {
                h.status = 'restarting';
                renderArchitecture();
                setTimeout(function () {
                    h.status = 'running';
                    updateStatus('Restart complete');
                    showNotification('✅ Host restarted!', 'success');
                    renderArchitecture();
                }, 2000);
            }, 1500);
        }, 1500);
    }

    function enableDRS() {
        if (!State.vms.length) {
            showNotification('⚠️ Deploy VMs first!', 'warning');
            return;
        }

        updateStatus('DRS analyzing clusters');
        showNotification('⚖️ DRS analyzing workload distribution...', 'info');

        setTimeout(function () {
            var workloadClusters = State.clusters.filter(function (c) {
                return c.id !== State.primaryMgmtClusterId;
            });

            if (!workloadClusters.length) {
                showNotification('⚠️ No workload clusters available!', 'warning');
                return;
            }

            var totalMigrated = 0;

            workloadClusters.forEach(function (cluster) {
                var clusterHosts = State.hosts.filter(function (h) {
                    return h.clusterId === cluster.id && h.status === 'running';
                });

                if (!clusterHosts.length) return;

                var clusterHostIds = clusterHosts.map(function (h) { return h.id; });
                var clusterVMs = State.vms.filter(function (vm) {
                    return clusterHostIds.indexOf(vm.hostId) !== -1;
                });

                if (!clusterVMs.length) return;

                clusterVMs.forEach(function (vm, idx) {
                    var targetHost = clusterHosts[idx % clusterHosts.length];
                    if (vm.hostId !== targetHost.id) {
                        vm.hostId = targetHost.id;
                        totalMigrated++;
                    }
                });
            });

            updateStatus('DRS balanced');
            updateLastAction('DRS balanced ' + totalMigrated + ' VMs');

            if (totalMigrated > 0) {
                showNotification('✅ DRS balanced ' + totalMigrated + ' VMs within their clusters!', 'success');
            } else {
                showNotification('✅ DRS: Clusters already balanced!', 'success');
            }

            renderArchitecture();
        }, 2000);
    }

    function resetAll() {
        if (confirm('Reset all infrastructure?')) {
            State.domains = [];
            State.clusters = [];
            State.vms = [];
            State.hosts = [];
            State.managementComponents = [];
            State.primaryMgmtClusterId = null;
            State.lastAction = 'None';
            updateStats();
            updateStatus('Ready to Build');
            updateLastAction('Reset');
            showNotification('🔄 Reset complete', 'info');
            renderArchitecture();
        }
    }

    function updateStats() {
        if (DOM.domainCount) DOM.domainCount.textContent = State.domains.length;
        if (DOM.clusterCount) DOM.clusterCount.textContent = State.clusters.length;
        if (DOM.vmCount) DOM.vmCount.textContent = State.vms.length;
        if (DOM.hostCount) DOM.hostCount.textContent = State.hosts.length;
        if (DOM.mgmtComponentCount) DOM.mgmtComponentCount.textContent = State.managementComponents.length;
    }

    function updateStatus(msg) {
        if (DOM.clusterStatus) DOM.clusterStatus.textContent = msg;
    }

    function updateLastAction(msg) {
        State.lastAction = msg;
        if (DOM.lastAction) DOM.lastAction.textContent = msg;
    }

    function toggleTheme() {
        State.theme = State.theme === 'light' ? 'dark' : 'light';
        document.body.setAttribute('data-theme', State.theme);

        if (DOM.themeToggle) {
            DOM.themeToggle.checked = State.theme === 'dark';
        }
    }

    function openUserGuide() {
        if (DOM.userGuideModal) {
            DOM.userGuideModal.classList.add('active');
            document.body.style.overflow = 'hidden';
        }
    }

    function closeUserGuide() {
        if (DOM.userGuideModal) {
            DOM.userGuideModal.classList.remove('active');
            document.body.style.overflow = '';
        }
    }

    function showNotification(msg, type) {
        var n = document.createElement('div');
        n.textContent = msg;
        var bg = type === 'success' ? '#4CAF50' : type === 'warning' ? '#FF9800' : type === 'error' ? '#f44336' : '#2196F3';
        n.style.cssText = 'position:fixed;top:20px;right:20px;padding:16px 24px;background:' + bg + ';color:#fff;border-radius:0.15rem;box-shadow:0 6px 20px rgba(0,0,0,.3);z-index:9999;font-weight:500;max-width:400px';
        document.body.appendChild(n);
        setTimeout(function () {
            if (n.parentNode) document.body.removeChild(n);
        }, 4000);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();
