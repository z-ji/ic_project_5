import Debug "mo:base/Debug";
import Iter "mo:base/Iter";
import List "mo:base/List";
import Nat "mo:base/Nat";
import Int "mo:base/Int";
import Principal "mo:base/Principal";
import Time "mo:base/Time";

actor {
  public type Message = {
    author: Text;
    text: Text;
    time: Time.Time;
  };

  public type Microblog = actor {
    follow : shared(Principal) -> async ();
    follows : shared query () -> async [Principal];
    post : shared (Text) -> async ();
    posts : shared query (since : Time.Time) -> async [Message];
    timeline : shared () -> async [Message];
    set_name : (Text) -> async ();
    get_name : shared query () -> async ?Text;
    reset : () -> async ();
  };

  stable var followed : List.List<Principal> = List.nil();
  stable var messages : List.List<Message> = List.nil();
  stable var name : ?Text = ?"";

  public shared (msg) func reset() : async () {
    assert(Principal.toText(msg.caller) == "gixtb-wbdvl-cjqaa-mlrgj-5p4es-xxmhl-uc3lb-qx3gg-v5qjz-slsez-oae");    
    followed := List.nil();
    messages := List.nil();
    name := ?"";
  };

  public shared func follow(id : Principal) : async () {
    followed := List.push(id, followed);
  };

  public shared query func get_name() : async ?Text {
    name;
  };

  public func set_name(aName : Text) : async () {
    name := ?aName;
  };

  public shared query func follows() : async [Principal] {
    List.toArray(followed);
  };

  public shared (msg) func post(otp : Text, text : Text) : async () {
    assert(otp == "otp");
    let aMessage = {
      author = getOptionalName(name);
      text = text;
      time = Time.now();
    };
    messages := List.push(aMessage, messages);
  };

  func getOptionalName(optionalName : ?Text) : Text {
    switch (optionalName) {
      case (null) { "" };
      case (?name) { name };
    }
  };

  public shared query func posts(since : Time.Time) : async [Message] {
    var newMsgs : List.List<Message> = List.nil();
    for (msg in Iter.fromList(messages)) {
      Debug.print("since: " # Int.toText(since));
      Debug.print("msg.time: " # Int.toText(msg.time));
      if (msg.time > since) {
        newMsgs := List.push(msg, newMsgs);
      }
    };
    List.toArray(newMsgs);
  };

  public shared func timeline(since : Time.Time) : async [Message] {
    var newMsgs : List.List<Message> = List.nil();

    for (id in Iter.fromList(followed)) {
      let canister : Microblog = actor(Principal.toText(id));
      let msgs = await canister.posts(since);
      for (msg in Iter.fromArray(msgs)) {
        newMsgs := List.push(msg, newMsgs);
      }
    };

    List.toArray(newMsgs);
  }
};
