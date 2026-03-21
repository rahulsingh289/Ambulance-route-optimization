#include <bits/stdc++.h>
using namespace std;

struct Edge {
    int to;
    double distance;
    double roadCondition;
    bool blocked;
    vector<pair<double,double>> path;
};

struct User {
    string email, password, role;
};

struct Ambulance {
    int id;
    int location;
    bool available;
};

// Hospitals and ambulances
vector<int> hospitals = {5,10,15,20};
vector<Ambulance> ambulances = {{101,0,true},{102,5,true},{103,10,true}};

class AuthSystem {
    unordered_map<string, User> users;

public:
    void loadUsers() {
        ifstream file("users.csv");
        if(!file){ cout<<"Error: users.csv not found!\n"; return; }
        string line; getline(file,line);
        while(getline(file,line)){
            stringstream ss(line);
            string email, pass, role;
            getline(ss,email,','); getline(ss,pass,','); getline(ss,role);
            users[email] = {email, pass, role};
        }
        cout<<"Users loaded successfully!\n";
    }

    bool login() {
        string email, password;
        cout<<"Enter Email: "; cin>>email;
        cout<<"Enter Password: "; cin>>password;
        if(users.count(email) && users[email].password == password){
            cout<<"Login successful!\n";
            return true;
        }
        cout<<"Login failed!\n";
        return false;
    }
};

class Graph {
public:
    int V;
    vector<vector<Edge>> adj;
    Graph(int v){ V=v; adj.resize(V); }

    double computeDistance(vector<pair<double,double>>& path){
        double total=0;
        for(int i=1;i<path.size();i++){
            double dx=path[i].first-path[i-1].first;
            double dy=path[i].second-path[i-1].second;
            total += sqrt(dx*dx + dy*dy);
        }
        return total*100;
    }

    void addEdge(int u,int v,vector<pair<double,double>> path){
        double dist = computeDistance(path);
        double cond = (rand()%100)/100.0;
        bool blocked = (rand()%10==0);
        adj[u].push_back({v, dist, cond, blocked, path});
        adj[v].push_back({u, dist, cond, blocked, path});
    }
};

pair<double,double> parsePoint(string s){
    s.erase(remove(s.begin(),s.end(),'('),s.end());
    s.erase(remove(s.begin(),s.end(),')'),s.end());
    stringstream ss(s); double a,b; char c; ss>>a>>c>>b;
    return {a,b};
}

vector<string> split(string s,char d){
    vector<string> v; string t; stringstream ss(s);
    while(getline(ss,t,d)) v.push_back(t);
    return v;
}

void loadRoads(string file,Graph &g){
    ifstream f(file);
    if(!f){ cout<<"Error: road_shape.csv not found!\n"; return; }
    string line; getline(f,line);
    int count=0;
    while(getline(f,line)){
        if(line.empty()) continue;
        stringstream ss(line); string a,b,c;
        getline(ss,a,','); getline(ss,b,','); getline(ss,c);
        if(a.empty()||b.empty()) continue;
        try{
            int u=stoi(a), v=stoi(b);
            if(u>=g.V||v>=g.V) continue;
            c.erase(remove(c.begin(),c.end(),'\"'),c.end());
            vector<string> pts = split(c,';'); vector<pair<double,double>> path;
            for(auto &x:pts) path.push_back(parsePoint(x));
            g.addEdge(u,v,path); count++;
        }catch(...){ continue; }
    }
    cout<<"Edges loaded: "<<count<<"\n";
}

vector<double> dijkstra(Graph &g,int src,vector<int>&par){
    vector<double> d(g.V,1e9);
    priority_queue<pair<double,int>, vector<pair<double,int>>, greater<>> pq;
    d[src]=0; pq.push({0,src}); par[src]=-1;
    while(!pq.empty()){
        auto [cd,u]=pq.top(); pq.pop();
        for(auto &e:g.adj[u]){
            if(e.blocked) continue;
            double cost = e.distance + e.roadCondition*20;
            if(d[u]+cost<d[e.to]){
                d[e.to]=d[u]+cost;
                par[e.to]=u;
                pq.push({d[e.to], e.to});
            }
        }
    }
    return d;
}

void printPath(int x,vector<int>&p){
    if(x==-1) return;
    printPath(p[x],p);
    cout<<x<<" ";
}

void emergencyCheck(Graph &g, vector<int>& path, double threshold){
    cout<<"\n===== EMERGENCY ROAD CONDITION CHECK =====\n";
    bool alert=false;
    for(int i=1;i<path.size();i++){
        int u=path[i-1], v=path[i];
        for(auto &e:g.adj[u]){
            if(e.to==v){
                cout<<"Road "<<u<<"->"<<v<<" condition: "<<e.roadCondition;
                if(e.roadCondition>=threshold || e.blocked){ cout<<" [ALERT]"; alert=true; }
                cout<<"\n"; break;
            }
        }
    }
    if(alert){
        cout<<"\nALERT: Poor road or blocked segments. Notify municipality/government.\n";
    } else cout<<"\nRoute is safe.\n";
}

int closestHospital(Graph &g, int patientLoc){
    int best=-1; double minDist=1e9;
    for(int h:hospitals){
        vector<int> par(g.V);
        auto dist=dijkstra(g,patientLoc,par);
        if(dist[h]<minDist){ minDist=dist[h]; best=h; }
    }
    return best;
}

int closestAmbulance(int patientLoc){
    int best=-1; double minDist=1e9;
    for(auto &a:ambulances){
        if(!a.available) continue;
        double dist = abs(a.location - patientLoc); // simple distance for demo
        if(dist<minDist){ minDist=dist; best=a.id; }
    }
    return best;
}

int main(){
    srand(time(0));
    cout<<"===== AMBULANCE MANAGEMENT SYSTEM =====\n";

    AuthSystem auth; auth.loadUsers();
    if(!auth.login()) return 0;

    Graph g(80);
    loadRoads("road_shape.csv",g);

    int patientLoc,hospitalLoc;
    cout<<"\nEnter Patient Location: "; cin>>patientLoc;
    cout<<"Enter Hospital Location (or -1 for closest): "; cin>>hospitalLoc;

    if(hospitalLoc==-1){
        hospitalLoc=closestHospital(g,patientLoc);
        cout<<"Closest hospital assigned: "<<hospitalLoc<<"\n";
    }

    int ambulanceId = closestAmbulance(patientLoc);
    if(ambulanceId!=-1){
        cout<<"Ambulance assigned: "<<ambulanceId<<"\n";
    } else cout<<"No ambulance available currently!\n";

    vector<int> parent(g.V);
    auto dist = dijkstra(g,patientLoc,parent);

    if(dist[hospitalLoc]>=1e9){ cout<<"No path available to hospital!\n"; return 0; }

    vector<int> path;
    for(int cur=hospitalLoc; cur!=-1; cur=parent[cur]) path.push_back(cur);
    reverse(path.begin(),path.end());

    cout<<"\n===== ROUTE ANALYSIS =====\n";
    cout<<"Optimal Path: "; for(int x:path) cout<<x<<" ";
    cout<<"\nTotal Cost: "<<dist[hospitalLoc]<<"\n";

    emergencyCheck(g,path,0.7);

    return 0;
}