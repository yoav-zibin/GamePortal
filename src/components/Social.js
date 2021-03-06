import React from 'react';
import './css/Social.css';
import { SocialIcon } from 'react-social-icons';
import {auth, facebookProvider, githubProvider, googleProvider, twitterProvider, db} from '../firebase';

export default class Social extends React.Component{

    constructor(){
        super();
        let providerExists = {};
        auth.currentUser.providerData.forEach((provider)=>{
            providerExists[provider.providerId.split('.')[0]] = true;
        });
        this.state = {
            google: !!providerExists.google,
            facebook: !!providerExists.facebook,
            twitter: !!providerExists.twitter,
            github: !!providerExists.github
        };
    }

    handleSocialConnect(provider){
        let self = this;
        let providerId = provider.providerId;
        let providerExists = false;
        auth.currentUser.providerData.forEach((myProvider)=>{
            if(providerExists)
                return;
            if(providerId === myProvider.providerId)
                providerExists = true;
        });
        if(providerExists){
            self.props.success();
            return;
        }
        auth.currentUser.linkWithPopup(provider).then(function(result) {
            // Accounts successfully linked.
            // var credential = result.credential;
            let user = result.user;
            user.providerData.forEach((provider)=>{
                if(provider.providerId===providerId){
                    let providerUid = provider.uid;
                    let uid = user.uid;
                    let userRef = db.ref('users/'+uid+'/privateFields/'+providerId.split('.')[0]+'Id');
                    userRef.set(providerUid);
                }
            });
            self.setState({
                [providerId.split('.')[0]]: true
            });
            self.props.success();
        }).catch(function(error) {
            console.log('error linking account:'+error.message);
            self.props.failed();
        });
    }

    render(){
        return(
            <div className="social-inner-container">
                {!this.state.twitter ?
                    <SocialIcon
                        onClick={()=>{this.handleSocialConnect(twitterProvider)}}
                        className='social-icon'
                        network="twitter"/> :
                    null
                }
                {!this.state.facebook ?
                    <SocialIcon
                        onClick={()=>{this.handleSocialConnect(facebookProvider)}}
                        className='social-icon'
                        network="facebook"/> :
                    null
                }
                {!this.state.google ?
                    <SocialIcon
                        onClick={()=>{this.handleSocialConnect(googleProvider)}}
                        className='social-icon'
                        network="google"/> :
                    null
                }
                {!this.state.github ?
                    <SocialIcon
                        onClick={()=>{this.handleSocialConnect(githubProvider)}}
                        className='social-icon'
                        network="github"/> :
                    null
                }
            </div>
        );
    }
}
