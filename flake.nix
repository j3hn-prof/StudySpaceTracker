{
description = "Nix devshells!";

  inputs = {
    nixpkgs.url = "github:nixos/nixpkgs?ref=nixos-unstable";
  };

  outputs = {self, nixpkgs, ...}: let
    system = "x86_64-linux";
    pkgs = import nixpkgs { system=system;};
  in {
    devShells.${system}.default = pkgs.mkShell {
      buildInputs = with pkgs; [
        python3Packages.pandas
        python3Packages.flask
        python3
        jq
        nodejs
        http-server
        live-server
      ];
    };
  };
}
